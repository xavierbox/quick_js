function create_page_header( parent_id, header_name, new_id, refresh_id, link_title1, link_title2 ){
    let header = ui.h3(header_name+' ', {
        children:
            [
            ui.caret({ id: 'toggle_table_view', class: 'caret' }, {}),
            ui.button(" "+link_title1+" ", { id: new_id, class: "button_link", children: [ui.icon({ class: "color_icon fa fa-plus-circle" })] }),
            ui.button(" "+link_title2+" ", { id: refresh_id, class: "button_link", children: [ui.icon({ class: "color_icon fa fa-refresh" })] }),
            ]
    });
    ui.addChildren(document.getElementById( parent_id), [header]);
    return header 

}


function toggle_hidden(element, class_name='hidden') {
            //this line below should work but...I have seen thats not always the case
            //element.classList.toggle('hidden');
            if (element.classList.contains(class_name)) element.classList.remove(class_name);
            else element.classList.add( class_name)
}

		
function getWebAppBackendUrl(url) { return url; } 
 

function get_server(iurl, imethod, idata) {

    return new Promise((resolve, reject) => {

        $.ajax({
            type: imethod,
            url: iurl,
            xhr: function () { return new window.XMLHttpRequest(); },

            processData: false,
            contentType: false,
            data: idata,
            success: function (resp) {
                console.log('------------------------------success')
                resolve(resp);
            },
            error: function (jqXHR, status, errorThrown) {
                console.log('------------------------error')
                reject(errorThrown);
            }
        });
    });//ajax promise
}



function list_something( url) {

    let end = getWebAppBackendUrl(url);
    get_server(end, 'get', {})
        .then((json_response) => {
            console.log('ok,', json_response)
            })
        .catch((error) => {
            console.log(error);
            console.log('--do error processing here', error);
            });
}
	
 

function upload_data_files(iurl, imethod, idata, progressUpdate, beforeFunction = undefined, successFunction = undefined, errorFunction = undefined ) {

    return new Promise((resolve, reject) => {

    console.log('seding data ', idata )
    for (const key of idata.values()) {
        console.log('values', key);
      }


        $.ajax({

            type: imethod,
            url: iurl,
            processData: false,
            contentType: false,
            data: idata,
            dataType: 'json',

            xhr: function () { 
                
                let xhr = new window.XMLHttpRequest(); 
            

                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        let percentComplete = ((evt.loaded / evt.total) * 100);

                        console.log(' progress ', Math.trunc(percentComplete) );
                        //$(".progress-bar").width(percentComplete + '%');
                        //$(".progress-bar").html(percentComplete+'%');

                        if( progressUpdate != undefined )
                        progressUpdate( Math.trunc(percentComplete) );
                    }
                }, false);

                return xhr;
            
            },

            beforeSend: function(){
                
                console.log('Before send was called ')
                if( beforeFunction != undefined )
                beforeFunction();

                //#$(".progress-bar").width('0%');
                //$('#uploadStatus').html('<img src="images/loading.gif"/>');
            },


            success: function ( data, textStatus, jqXHR ) { //(resp){//(resp) {
                console.log('---------------------ajax---------success', data)
                if(successFunction != undefined )
                successFunction(data, textStatus, jqXHR);
                resolve(data, textStatus, jqXHR);
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log('------------------ajax------error', jqXHR, textStatus, errorThrown)
                if(errorFunction!=undefined)
                errorFunction(jqXHR, textStatus, errorThrown)
                reject(jqXHR, textStatus, errorThrown);
            }
        });
    });//ajax promise
}
