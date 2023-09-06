
//import  './css/components/ui.js';





class DataPageView {

    toggle_hidden(element, class_name = 'hidden') {
        //this line below should work but...I have seen thats not always the case
        //element.classList.toggle('hidden');
        if (element.classList.contains(class_name)) element.classList.remove(class_name);
        else element.classList.add(class_name)
    }

    createDataPage() {

        this.createlements();
        this.connectEvents();

       // this.temporal_stuff();
    }

    createlements() {
        this.create_header();
        this.create_table_section();
        this.create_upload_formm();

        this.temporal_stuff();


    }



    create_header() {
        let header = ui.h3('Datasets ', {
            children:
                [
                ui.caret({ id: 'toggle_table_view', class: 'caret' }, {}),
                ui.button(" New ", { id: "new_dataset_button", class: "button_link", children: [ui.icon({ class: "color_icon fa fa-plus-circle" })] }),
                ui.button(" Refresh ", { id: "refresh_dataset_button", class: "button_link", children: [ui.icon({ class: "color_icon fa fa-refresh" })] }),
                ]
        });

        ui.addChildren(document.getElementById('datasets_header'), [header]);//[ui.caret( attribues = {id:'toggle_table_view',class: 'caret'}, {})] );
        return header 
    }

    create_table_section() {

        //the table part 
        let table_data = get_table_data()
        let datasets_table = ui.table(table_data,
            { id: 'datasets_table', class: "table no_table-dark no_table-striped table-bordered table-hover" },
            { class: "btn-primary" });
        ui.addChildren(document.getElementById('datasets_table_container'), [datasets_table]);
    }

    create_upload_formm() {
        /////////////// upload form /////////////////
        let title = ui.h3('New dataset')
        let label = ui.label('Dataset name', { class: 'bold', for: 'dataset_name_input' }, { fontWeight: 'bold' });
        let name_input = ui.text_input({ id: 'dataset_name_input', class: 'form-control', placeholder: 'Enter a name' },{ fontStyle: "italic" }
        );

        let check = ui.checkbox('Overwrite same-name dataset if any', true, { id: 'overwrite_dataset' });
        let div1 = ui.create_element('div', { children: [title, label, name_input, check], class: 'form-group' }, { marginBottom: '25px' })

        let form = ui.create_element('div', { id: 'form-upload', class: '88form aacard 88modal-content n-animate' }, { aapaddingTop: '50px' });
        ui.addChildren(form, [div1])


        let labels = ['Injectors', 'Producers', 'Locations'];
        for (let n = 0, file_ids = ['injectors_file', 'producers_file', 'locations_file']; n < labels.length; n++) {

            let section = ui.div({
                class: 'form-group', children: [
                    ui.label(labels[n], { class: 'bold', for: file_ids[n] }, { fontWeight: 'bold', marginTop: '5px' }),

                    ui.file_input({ id: file_ids[n], class: "form-control" })
                ]
            });

            ui.addChildren(form, [section])
        }

        //buttons
        let form_buttons_container = ui.div({
            children:
                [
                ui.create_element( 'progress', { class:'hidden', id: 'data_upload_progress_bar',value:"0", min:'0',max:"100"}, {} ),
                ui.button('Upload', { id: 'start_upload_button', class: 'btn btn-primary' }, { margin: '5px', float: "right" }),
                ui.button('Cancel', { id: 'cancel_upload_button', class: 'btn btn-danger' }, { margin: '5px', float: "right" }),
                ui.br(), ui.br()
                ]
        });


        ui.addChildren(form, [ui.hr(), form_buttons_container])
        ui.addChildren(document.getElementById('data_upload_modal_form'), form);
    }

    temporal_stuff() {

        //rersult can be error, success/ok, warning/info      
        let alerts = [  {message: 'Basic pre-processing (column names, dates formatting, data types and acronysms)', result: 'ok'},
                        {message: 'Checked for minimum columns required', result: 'error'},
                        {message: 'Locations for all wells checked', result: 'warning'},
                        {message: 'info om Locations for all wells checked', result: 'info'},
        ]
                        
        console.log( 'alrts are', alerts )
        let transformed = []
        alerts.forEach( (alert) => //convert to alert type( ), message notes  
        { transformed.push ( {  type: alert['result'], message:alert['message'], notes: alert['result']} );
        });


        let data_report = ui.alert_list( transformed );
        ui.addChildren( document.getElementById('data_report'),[data_report] );


        let data_report2 = ui.alert_list( transformed );
        ui.addChildren( document.getElementById('data_quality_report'),[data_report2] );



        }



    connectEvents() {

        //toggle visibility of the table 
        document.getElementById('toggle_table_view').addEventListener('click', (evt) => {
            let element = document.getElementById('datasets_list_container');
            this.toggle_hidden(element, 'hidden');
        });

        //refresh dataset list 
        document.getElementById('refresh_dataset_button').addEventListener('click', (evt) => {

            let element = document.getElementById('datasets_table');
            console.log('the table is ', element);

            get_server('datasets_list', 'get', {})
                .then((response) => { element.setData(response); })
                .catch((error) => { console.log('error'); });
        });


        //datasets table toolbar buttons [delete, download, etc ] 
        Array.from(document.getElementsByClassName('datasets_table_toolbar_button')).forEach((btn) => {
            btn.addEventListener('click', (evt) => {
                let table = document.getElementById('datasets_table');

                if (table.selected < 0) {
                    alert('Click on a dataset row (if any) to select it. Then select the action to perform ');
                }

                if (btn.name.toLowerCase().trim() == 'delete') {
                    let text = "Do you want to delete the selected dataset?. Please confirm";
                    if (confirm(text) == true) {
                        console.log('ok was pressed');
                    }
                    else return;
                }

            });
        });


        //open modal form to upload new data 
        document.getElementById('new_dataset_button').addEventListener('click', (evt) => {
            //document.getElementById("data_upload_modal_form").style.display = "block";
            toggle_hidden(document.getElementById("data_upload_modal_form"));

        });

        //cancel upload and close form 
        document.getElementById('cancel_upload_button').addEventListener('click', (evt) => {
            evt.preventDefault();
            let element = document.getElementById("data_upload_modal_form");
            element.classList.add('hidden');//.style.display = "none";
            element.style.display = "none";

        });


 

        //start the upload
        document.getElementById('start_upload_button').addEventListener('click', (evt) => {
            evt.preventDefault();
            //parse the form. if something is missing, then return an error to the user.
            //dataset_name_input, overwrite_dataset, 'injectors_file','producers_file','locations_file'

            let dataset_name = document.getElementById('dataset_name_input').value.trim();
            if (dataset_name.length === 0) {
                alert("The name given to the dataset is an empty string!");
                return;
            }


            let overwrite = document.getElementById('overwrite_dataset').checked;
            let injectors_file = document.getElementById('injectors_file').files[0];
            let producers_file = document.getElementById('producers_file').files[0];
            let locations_file = document.getElementById('locations_file').files[0];

            //if ((producers_file == undefined) || (injectors_file == undefined) || (locations_file == undefined)) {
            //    alert('File(s) missing. Please select a file for injection data, production data and well locations');
            //    return;
            //}

            let fdata = new FormData();
            
            fdata.append( 'dataset_name', dataset_name);

            fdata.append( 'overwrite', overwrite);
            fdata.append( 'injectors_file', injectors_file);
            fdata.append( 'producers_file', producers_file);
            fdata.append( 'locations_file', locations_file);

            
            let bar    = document.getElementById('data_upload_progress_bar')
            let report = document.getElementById('data_report');//.innertHTML = "" 
            let progressUpdate = function( value ){bar.value = value;}
            let beforeFunction = function() { bar.classList.remove('hidden'); bar.value = 0; report.innerHTML='';report.classList.add('hidden');}
            let successFunction = function(data, textStatus, jqXHR) { bar.classList.add('hidden');}
            let errorFunction   = function(jqXHR, textStatus, errorThrown) { console.log(jqXHR.responseJSON); }


            
            let prepare_report = function( resp ) {
                let alerts = resp['processing']
                let transformed = []
                alerts.forEach( (alert) => //convert to alert type( ), message notes  
                { transformed.push ( {  type: alert['result'], message:alert['message'], notes: alert['result']} );
                });

                return  transformed;
            }


            upload_data_files( 'upload_data_files', 'post', fdata,progressUpdate, beforeFunction, successFunction, errorFunction  )
            .then( (data)=>{
                
        
                transformed = prepare_report( data )
                let data_report = ui.alert_list( transformed );
                let container = document.getElementById('data_report'); 
                container.innerHTML = ''
                ui.addChildren( container,[data_report] );
                container.classList.remove('hidden');

            }).catch( (jqXHR, textStatus, errorThrown)=>{

                transformed = prepare_report( jqXHR.responseJSON )
                console.log('err here in the main application ', transformed );
                transformed = prepare_report( data )
                let data_report = ui.alert_list( transformed );
                let container = document.getElementById('data_report'); 
                container.innerHTML = ''
                ui.addChildren( container,[data_report] );
                container.classList.remove('hidden');
   
            });

            //upload_data_files( data  ); 
            //get_server( 'upload_data_files', 'post', data)
            //.then( (response)  =>{
            //
            //    console.log('success');
            // 
            //}).catch ( (error) =>{
        


        });


    }//connect


};	