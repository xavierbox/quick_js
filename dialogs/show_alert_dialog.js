


function show_alert_dioalog( message = 'Default message' ){
	alert( message );
}

function show_dialog_info( title='Default title', message='Default message', button_text='Close'){

 let body = document.getElementsByTagName('body')[0]

 let div = document.createElement('div'); 
 div.setAttribute('style', "display: block")
 div.classList.add( 'modal','modal-dialog','modal-dialog-centered' );
 
 
  let div2 = document.createElement('div'); 
      div2.classList.add("modal-dialog")
  let modal_content = document.createElement('div'); 
      modal_content.classList.add("modal-content")
      
   let header_div = document.createElement('div'); 
   header_div.classList.add("modal-header")
   let title_header = document.createElement('h4'); 
   title_header.textContent = title;
   header_div.appendChild(title_header);
       
   modal_content.appendChild(header_div);
	  
    
  let modal_body = document.createElement('div'); 
      modal_body.classList.add("modal-body")
      modal_body.innerHTML = message;
	  
      modal_content.appendChild(modal_body);
      
  let modal_footer = document.createElement('div'); 
      modal_footer.classList.add("modal-footer")
      modal_content.appendChild(modal_footer); 
      
  
  let btn = document.createElement("BUTTON");
		 btn.innerHTML= button_text;
		 btn.setAttribute('text', button_text); 
         btn.classList.add("btn")
         btn.classList.add("btn-primary")
         
  btn.addEventListener( "click", (evt)=>{
  div.remove();
  });
         
 modal_footer.appendChild(btn);   

 div2.appendChild(modal_content); 
 div.appendChild(div2); 
 body.appendChild(div); 
} 

