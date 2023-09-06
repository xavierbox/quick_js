
import os, sys, stat,numpy as np, pandas as pd, json
from pathlib import Path, PurePath
from flask import Flask, request, jsonify 
from flask import make_response, stream_with_context, render_template, request, Response, session, url_for

sys.path.append("../../../")

crm_folder = str( PurePath("C:/Jupyter/CRMDev/"))
sys.path.append( str(crm_folder) ) 
DATA_FOLDER = str( PurePath('C:/Jupyter/CRMDev/Data/ExampleData/')) 

from crm_lib2.crm_definitions import *
from crm_lib2.data.dataiku_storage_connector import RawDataProcessing,DataikuStorageConnector, FileSystemStorageConnector
from crm_lib2.data.crm_dataset import CRMDataset

DataConnector = FileSystemStorageConnector

UPLOAD_FOLDER = r'C:/Jupyter/quick_js/app/TEMPS/'
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



#####################################################



class RawDataChecker :
    
    def __init__(self  ):
        pass 
        
        
    def minimum_columns_required( self ):

        #these are the meanings that need to be there.
        columns = set( [DATE_KEYS[0],NAME_KEYS[0],LIQUID_PRODUCTION_KEYS[0],WATER_INJECTION_KEYS[0], X_KEYS[0], Y_KEYS[0]] )

        data = self.data 

        #m1 is a dictionary where the key is the column name found and the value is the maning that it represents. 
        #we need to check that the meanings above are all present. 
        m1  = set(columns_to_meaning_map( data.injectors_df.columns ).values() )
        m1.update(set( columns_to_meaning_map( data.producers_df.columns ).values() ))
        m1.update(set( columns_to_meaning_map( data.locations_df.columns ).values() ))

        for name in columns:
            if name not in m1:
                raise ValueError(f'Column for the meaning {name} and maybe others are not found in the dataset')

        return self 
    
 
    def all_well_locations( self ):
        
        data = self.data
        locs = set(data.locations_df['NAME'].unique())
        if len(locs.intersection( set(data.injector_names))) != len(data.injector_names):
            raise ValueError('The location of some injectors was not provided')
        
        if len(locs.intersection( set(data.producer_names))) != len(data.producer_names):
            raise ValueError('The location of some producers was not provided')
        
     
        return self 
    
 
    def check_time_gaps( self ): #result fixed
        pass
    
    def check_noise( self ):
        pass 
    
    def run( self,dataset ):

        self.data = dataset 

        checker = self 
        checks_chain = [
                        (checker.minimum_columns_required,{'message':'Checked for minimum columns required', 'result': 'ok'}),
                        (checker.all_well_locations,{'message': 'Locations for all wells checked', 'result': 'ok'})
                       ]

        log = []
        success = True 
        for check in checks_chain:
            try:
                check[0]()
                log.append( check[1])
            except Exception as e:
                log.append( {'message': check[1]['message'], 'result':'error'} )
                print('chain interrupted ')
                success = False 
                
                
        return success, log  
    

        


#####################################################


@app.route('/datasets_page')
def datasets_page():
	return render_template('dataset_page_v2.html', data = {'title':'dataset_page_v2'})



@app.route('/')
def hello_world():
	return render_template('home.html', data = {'title':'home'})


@app.route('/datasets_list')
def datasets_list():

     
    storage = DataConnector( DATA_FOLDER  )
    datasets= storage.list_datasets()

    d = []	
    for dataset_name in datasets:
        try:
            data = storage.get_fields_regions( dataset_name )
           
            d.append({'Name': dataset_name,
                       'Regions': data['REGION'], 
                       'Fields': data['FIELD'] 
                     })
        except:
            pass

    print('returning response')
    response = make_response( json.dumps(d) , 200) 
    response.headers["Content-Type"] = "application/json"
    return response


def upload_temp_dataset( files, dataset_name ):
   
    temporary_path = r'C:/Jupyter/quick_js/app/TEMPS/'   
    dataset = None 
    
    try:
        os.mkdir( os.path.join(temporary_path,dataset_name ))
    except:
        pass 

    temporary_path = os.path.join(temporary_path,dataset_name)
    try:
        file = os.path.join(temporary_path,'injectors.csv')
        with open(file, 'wb') as f: f.write(  files['injectors.csv'].read() )
        file = os.path.join(temporary_path,'producers.csv')
        with open(file, 'wb') as f: f.write(  files['producers.csv'].read() )
        file = os.path.join(temporary_path,'locations.csv')
        with open(file, 'wb') as f: f.write(  files['locations.csv'].read() )
    
    except Exception as e:
        return False, str(e), None 
    
    try:
        #now read the files, construct a CRMDataset and pre-process it. 
        storage = FileSystemStorageConnector( temporary_path )
        inj = storage.read_csv_path( os.path.join(temporary_path,'injectors.csv') )
        prd = storage.read_csv_path( os.path.join(temporary_path,'producers.csv') )
        loc = storage.read_csv_path( os.path.join(temporary_path,'locations.csv') )
        
        dataset = CRMDataset.instance( inj, prd, loc )
        return True, "", dataset
    
    except Exception as e:
        print(e)
        return False, str(e), None  

      
    return True, "", dataset 

@app.route('/upload_data_files', methods=['POST'])
def upload_data_files():

    print('Reached the end-point to upload data files ')    

    dataset_name = request.form.get('dataset_name')
    overwrite = request.form.get('overwrite')
    files = request.files
    from_ui = {
                  'injectors.csv': files.get('injectors_file'),
                  'producers.csv': files.get('producers_file'),
                  'locations.csv': files.get('locations_file')
    }

    success,error, dataset =  upload_temp_dataset( from_ui, dataset_name )
    if success == False: 
        response = make_response(  'Error uploading data '+error , 400) 
        response.headers["Content-Type"] = "application/json"
        return response
    
    log = [] 
    success, error = RawDataProcessing().run( dataset )
    if success == False: 
        log.insert(0, { 'message': error, 'result':'abort'} )
        d = { 'dataset_name': dataset_name, 'temporal': True, 'processing': log, 'acceptable': False }
        s = json.dumps(log)
        response = make_response(  s , 400) 
        response.headers["Content-Type"] = "application/json"
        return response
    

    success, log = RawDataChecker().run(dataset)
    if success == False: 
        d = { 'dataset_name': dataset_name, 'temporal': True, 'processing': log, 'acceptable': False }
        s = json.dumps(d)
        response = make_response(  s , 400) 
        response.headers["Content-Type"] = "application/json"
        return response
    
    log.insert(0, { 'message':'Basic pre-processing (column names, dates formatting, data types and acronysms)', 'result':'ok'} )
    d = { 'dataset_name': dataset_name, 'temporal': True, 'processing': log, 'acceptable': True }
 
    s = json.dumps(d)
    response = make_response(  s , 200) 
    response.headers["Content-Type"] = "application/json"
    return response
 





    d= {'message':'hard-coded success returned'}
    s = json.dumps(d)
    print(s)
    response = make_response(  s , 200) 
    response.headers["Content-Type"] = "application/json"
    return response




app.run()