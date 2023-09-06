/*

http://www.java2s.com/example/javascript/dom-html-element/form-index.html
function load(context) {

	var defaults = {
		parameter1: defaultValue1,
		parameter2: defaultValue2,
		...
	};

	var context = extend(defaults, context);

	// do stuff
}
This way, if you have many parameters but don't necessarily need to set them with each call to the function, you can simply specify the non-defaults. For the extend method, you can use jQuery's extend method ($.extend()), craft your own or use the following:

function extend() {
	for (var i = 1; i < arguments.length; i++)
		for (var key in arguments[i])
			if (arguments[i].hasOwnProperty(key))
				arguments[0][key] = arguments[i][key];
	return arguments[0];
}
*/
function get_table_data() {
	data = [
		{
			'Name': 'Dataset1',
			'Regions': ['UI'],
			'Fields': ['CLB', 'YLB']
		},
		{
			'Name': 'Dataset2',
			'Regions': ['UI'],
			'Fields': ['YLB'],
			'Sine': 32

		},
		{
			'Name': 'Dataset3',
			'Regions': ['UI'],
			'Fields': ['ACA', 'CLB', 'YLB'],
			'well count': 12
		}]

	return data
}



class ui {

	static test_item(context = { id: undefined, children: [] } = {}, attributes = {}, style = {}) {


		for (var i = 0; i < arguments.length; i++)
			//console.log('arguments', i, arguments[i])
			if (arguments[i] != undefined)
				for (var key in Object.keys(arguments[i]))
					console.log(key);

	}


	/*new prototypes */




	static double_range_slider( attributes = {}  ){
		/*
		
		<div class="double-range">
			<div class="double-range-slider">
			<span class="double-range-selected"></span>
			</div>
			<div class="double-range-input">
			<input type="range" class="double-range-min" min="0" max="100" value="30" step="1">
			<input type="range" class="double-range-max" min="0" max="100" value="70" step="1">
			</div>
			<p></p>
		</div> 

		
		*/
		let rangeMin = 10; 
		if( rangeMin in attributes ) rangeMin = attributes['rangeMin'];

		let top_div  = ui.create_element('div',{ class:"double-range"});
		let slider   = ui.create_element('div',{ class:"double-range-slider"});
		let span     = ui.create_element('span',{ class:"double-range-selected"});
		ui.addChildren( slider, span )
		ui.addChildren(top_div, slider )

		let input_div  = ui.create_element('div',{ class:"double-range-input"});
		let range1  = ui.create_element('input',{ type:'range', class:"double-range-min", min:"0", max:"100", value:"30", step:"1"});
		let range2  = ui.create_element('input',{ type:'range', class:"double-range-max", min:"0", max:"100", value:"70", step:"1"});
		
		ui.addChildren( input_div, [ range1,range2] )
		ui.addChildren( top_div, input_div )
		ui.addChildren( top_div, ui.create_element('p'));

		top_div.raise = function(){
			let data = {'value1':range1.value, 'value2': range2.value, element:top_div, slider1:range1, slider2:range2, id:top_div.id }
			let x = new CustomEvent("clicked", { bubbles: true, detail: data });
			top_div.dispatchEvent(x);
		}

		top_div.initialize_ranges = function(){
			const rangeInput = document.querySelectorAll(".double-range-input input");
			rangeInput.forEach((input) => {
			input.addEventListener("input", (e) => {
			  let minRange = parseInt(rangeInput[0].value);
			  let maxRange = parseInt(rangeInput[1].value);
			  if (maxRange - minRange < rangeMin) {     
				if (e.target.className === "double-range-min") {rangeInput[0].value = maxRange - rangeMin;} 
				else {rangeInput[1].value = minRange + rangeMin;}
			  } else {
		   
				span.style.left = (minRange / rangeInput[0].max) * 100 + "%";
				span.style.right = 100 - (maxRange / rangeInput[1].max) * 100 + "%";
			  }
			});
		  }); 
		  
		  top_div.raise();
		}

		let ranges = [range1, range2 ];
		ranges.forEach((input) => {input.addEventListener("change", (e) => {top_div.initialize_ranges();})});
        top_div.initialize_ranges();
	 
		


		let s =`
		.double-range-slider {
			height: 5px;
			position: relative;
			background-color: #e1e9f6;
			border-radius: 2px;
		  }
		  .double-range-selected {
			height: 100%;
			left: 30%;
			right: 30%;
			position: absolute;
			border-radius: 5px;
			background-color: #1b53c0;
		  }
		  .double-range-input {
			position: relative;
		  }
		  .double-range-input input {
			position: absolute;
			width: 100%;
			height: 5px;
			top: -7px;
			background: none;
			pointer-events: none;
			-webkit-appearance: none;
			-moz-appearance: none;
		  }
		  .double-range-input input::-webkit-slider-thumb {
			height: 20px;
			width: 20px;
			border-radius: 50%;
			border: 3px solid #1b53c0;
			background-color: #fff;
			pointer-events: auto;
			-webkit-appearance: none;
		  }
		  .double-range-input input::-moz-range-thumb {
			height: 15px;
			width: 15px;
			border-radius: 50%;
			border: 3px solid #1b53c0;
			background-color: #fff;
			pointer-events: auto;
			-moz-appearance: none;
		  }
		  `

		let st = ui.create_element('style');
		st.innerHTML = s;
		ui.addChildren( top_div, st )

		ui.addAttributesTo(top_div, attributes );
		return top_div;

	}

	static create_element(tag, attributes = {}, style = {}) {

		//console.log('creating element', tag )
		let ele = document.createElement(tag);
		if ('id' in attributes) ele.setAttribute('id', attributes['id']);

		ui.addAttributesTo(ele, attributes);
		ui.setStyle(ele, style);
		if ('children' in attributes) {
			//console.log('found children ', attributes['children'] );
			ui.addChildren(ele, attributes['children']);
			delete attributes['children'];
		}

		ele.addChildren = function (children) { ui.addChildren(this, children); return this; }
		return ele;
	}

	static row(attributes = {}, style = {}) {
		let row = ui.create_element('div', attributes, style);
		row.classList.add('row');
		return row;
	}

	static alert_list( alerts,  attributes, style ) {

		let container = ui.create_element('div', attributes , style ) 

		let s = ""

		console.log('here atts are ', alerts );
		 
		alerts.forEach( (message) => 
			{
			let class_name = message["type"]		
			let text       = message['message'];
			let notes      = message['notes']
			if(class_name == undefined){class_name= 'alert-box'}
			
			//because we are creating the element as a string, all the strings in the properties (such as class) 
			//need to have quotations as if we were writing the element as a string 
			class_name = `"${class_name}"`
			//let s1 = `<div class=${class_name}><p>${text} <strong style="float:right">${notes}</p></strong></div>`
			let s1 = `<div class=${class_name}><p>${text} <strong style="float:right">${notes}</p></strong></div>`
			
			s = s + s1;
			});
		container.innerHTML = s; 
	
		return container; 
	}


	static column(attributes = {}, style = {}) {

		let col = ui.create_element('div', attributes, style);

		if ('size' in attributes) col.classList.add('col-' + attributes['size'].toString());
		else col.classList.add('col');

		return col;
	}


	static h3(text, attributes = {}, style = {}) {

		let e = ui.create_element('h3', attributes, style)
		let textNode = document.createTextNode(text);
		if (e.hasChildNodes())
			e.insertBefore(textNode, e.childNodes[0]);
		else
			e.appendChild(textNone);

		return e;
	}


	static br() { return [document.createElement("br")]; }


	static hr() { return document.createElement("hr"); }


	static button(text, attributes = {}, style = {}) {

		let btn = ui.create_element("BUTTON", attributes, style);

		btn.setAttribute('text', text);
		let textNode = document.createTextNode(text);

		if (btn.hasChildNodes())
			btn.insertBefore(textNode, btn.childNodes[0]);
		else
			btn.appendChild(textNode);

		btn.nClicks = 0;


		btn.raise = function (data) {
			let x = new CustomEvent("clicked", { bubbles: true, detail: data });
			btn.dispatchEvent(x);
		}

		btn.addEventListener("click", (evt) => {
			btn.nClicks = btn.nClicks + 1;
			let data = { 'nClicks': btn.nClicks, 'text': text.trim(), 'element': btn, 'parent': btn.parentNode };
			btn.raise(data);
		});


		return btn


	}


	static icon(attributes, style) {
		let icon = document.createElement('i');
		ui.addAttributesTo(icon, attributes);
		ui.setStyle(icon, style);
		return icon;
	}


	static label(text = 'default', attributes = {}, style = {}) {

		let x = document.createElement("LABEL");
		let t = document.createTextNode(text);

		ui.addAttributesTo(x, attributes);// e.g. "for", "male");
		x.appendChild(t);

		ui.setStyle(x, style);
		return x;
	}


	static table(items, table_attributes = {}, header_attributes = {}) {

		console.log('creating table');
		//The table header columns are all the keys in the items object (a dictionary)
		//we put all these keys in a set so they arent repeated. 

		//create the table, its header row and append the table to a parent element
		let table = ui.create_element('table', table_attributes, {});
		let tbody = ui.create_element('tbody',);
		let thead = ui.create_element('thead', header_attributes);


		table.appendChild(tbody);
		table.appendChild(thead);
		table.head = thead;
		table.body = tbody;
		table.selected = -1;



		//main click event 
		table.raise_click_event = function (data) {
			let x = new CustomEvent("clicked", { bubbles: true, detail: data }); this.dispatchEvent(x);
		}


		table.clearSelection = function () {

			let rows = table.rows;
			for (let i = 0; i < rows.length; i++)
				rows[i].classList.remove('selected');
		}


		table.setData = function (data) {

			console.log('---setting table fdata', data)
			table.selected = -1;
			table.head.remove();
			table.body.remove();

			let thead = ui.create_element('thead', header_attributes);
			let tbody = ui.create_element('tbody',);

			table.appendChild(thead);
			table.appendChild(tbody);

			table.head = thead;
			table.body = tbody;

			let head = table.head;
			let body = table.body;


			let table_columns = new Set()
			data.forEach((element) => {
				Object.keys(element).forEach((one) => { table_columns.add(one); });
			});


			table_columns.forEach((column) => {
				head.appendChild(document.createElement("th")).appendChild(document.createTextNode(column));
			});

			//create the rows 
			let s = Array.from(table_columns);
			data.forEach((item) => {           //for each item in the json

				let counter = 0;
				let row = table.insertRow(-1); //add a row at the end 
				//ui.addAttributesTo(row,{class:'active'});

				s.forEach((key) => {             //for each column name   
					let value = item[key];           //fetch the value for the item (may be undefined)
					let c1 = row.insertCell(counter); //and add the cell to the row. 

					if (value == undefined) c1.innerText = ''  //yet if the value was undefined 
					else c1.innerText = value;                //dont add the string 'undefined' set it to empty 

					counter = counter + 1;
				});
			});


			//now the events 
			let rows = table.rows;
			for (let i = 0; i < rows.length; i++)      //for each row 
			{
				let row = rows[i];

				row.addEventListener('click', (evt) =>   //add a click event 
				{
					//set the class list to selected in this row and delete any selected in sibling rows. 	
					for (let k = 0; k < rows.length; k++) {
						rows[k].classList.remove('selected');
					}

					rows[i].classList.add('selected');
					table.selected = i;

					const cell = evt.target.closest('td');
					if (!cell) { return; }// not clicked on a cell

					let cellText = evt.target.innerText;
					let data = { 'row_index': i, 'cell_text': cellText, 'cell_index': cell.cellIndex }
					//these are the event-details 
					//the index of the row and cell clicked.
					//the text in the cell clicked 
					let cells = row.cells;                               //plus the header and the value of each cell for the headers
					for (let n = 0; n < s.length; n++) data[s[n]] = cells[n].innerText;

					//also the number of clickc cummulated in the table, the table element itself, the row elelemnt and the cell eleemnt 
					table.nClicks += 1
					data['nclicks'] = table.nClicks;

					data['table_element'] = table;
					data['row_element'] = row;
					data['cell_element'] = cell;
					table.raise_click_event(data);
				});
			}

			//the table basic properties, such as num rows, header column names, etc...
			table.numRows = table.rows.length;
			table.nClicks = 0
			table.headerColumnNames = Array.from(table_columns);
		}//set data 

		table.getRowSelected = function () {
			;

		}

		table.getRow = function (index) {
			;

		}



		console.log('reaching here', data);
		table.setData(data);
		return table;
	}


	static caret(attributes = {}, style = {}) {

		let element = ui.create_element('button', attributes, style);

		let icon = document.createElement('i');
		icon.classList.add('fa', 'fa-caret-down');
		element.appendChild(icon);
		element.state = true;
		element.nClicks = 0;


		element.raise_click_event = function (data) { this.dispatchEvent(new CustomEvent("clicked", { bubbles: true, detail: data })); }

		element.addEventListener('click', (evt) => {
			element.nClicks = element.nClicks + 1;

			if (icon.classList.contains('fa-caret-up')) {
				icon.classList.remove('fa-caret-up')
				icon.classList.add('fa-caret-down')
				element.state = false;
			}
			else {
				icon.classList.add('fa-caret-up')
				icon.classList.remove('fa-caret-down')
				element.state = true;
			}

			let data = { 'state': element.state, 'nClicks': element.nClicks }
			data['element'] = element;
			element.raise_click_event(data);
		});

		return element;
	}


	static checkbox(label, checked = false, attributes = {}, style = {}) {

		let chk = ui.create_element('input', attributes, style);
		chk.setAttribute('type', 'checkbox');       // SPECIFY THE TYPE OF ELEMENT.
		if (checked) chk.setAttribute('checked', true);



		let lbl = document.createElement('label');
		let id = undefined;
		if ('id' in attributes)
			id = attributes['id'];
		else id = "id" + Math.random().toString(16).slice(2)

		lbl.setAttribute('for', id);

		lbl.setAttribute('style', 'padding-left: 5px');

		let textNode = document.createTextNode(' ' + label);
		lbl.appendChild(textNode)



		chk.label = lbl;
		chk.raise = function (data) {
			let x = new CustomEvent("clicked", { bubbles: true, detail: data });
			chk.dispatchEvent(x);
		}

		chk.addEventListener("click", (evt) => {
			data = { 'checked': chk.checked, 'text': label, 'element': chk, 'parent': chk.parentNode };
			chk.raise(data);
		});

		return [chk, lbl];
	}


	static icon_button(text, icon_attributes = {}, attributes = {}, icon_style = {}, button_style = {}) {
		//<button class="btn"><i class="fa fa-download"></i></button>
		let button = ui.button(text, attributes, button_style);
		let icon = ui.icon(icon_attributes, icon_style);
		button.appendChild(icon);
		return button;

	}


	static text_input(attributes = {}, style = {}) {
		let y = ui.create_element("INPUT", attributes, style);
		y.setAttribute("type", "text");
		return y;
	}


	static file_input(attributes = {}, style = {}) {
		let y = ui.create_element("INPUT", attributes, style);
		y.setAttribute("type", "file");
		return y;
	}


	//end new prototypes 




	static link(text, attributes = {}, style = {}) {
		let l = ui.create_element('a', attributes, style);
		l.appendChild(document.createTextNode(text));


		return l;
	}



	static icon_link(text, attributes = {}, style = {}) {

		let element = ui.create_element('i', attributes, style);
		element.appendChild(document.createTextNode(text));


		element.nClicks = 0;

		return element;
	}

	/*static icon_link( text, attributes = {}, style = {} ){
	
	let element = ui.create_element('a', {}, {}, {} );	
	element.classList.add('icon_link');
	
	let icon =  document.ui.create_element('i', {},attributes, style );
	element.appendChild(icon); 
	element.nClicks = 0;
	element.appendChild(document.createTextNode(text));
	
	ui.addAttributesTo(icon, attributes);
	ui.setStyle( icon, style );

	return element; 
}*/



	static div(context = { id: undefined, children: [] } = {}, attributes = {}, style = {}) {
		let div = document.createElement('div');

		if ('id' in context) div.setAttribute('id', context['id']);
		if ('children' in context) ui.addChildren(div, context['children']);

		ui.addAttributesTo(div, attributes);
		ui.setStyle(div, style);
		return div
	}


	static old_div(id = undefined, children = undefined, attributes = undefined, style = undefined) {
		let div = document.createElement('div');

		if (id != undefined)
			div.setAttribute('id', id);

		if (children != undefined) { ui.addChildren(div, children); }
		ui.addAttributesTo(div, attributes);
		ui.setStyle(div, style);


		return div
	}




	/*
	The ui class only contains static methods to generate with minimal code configurable HTML elements.
	
	In this first commit, only a table component is being generated and the class is defined inside the 
	html page. In future commits, the ui class will be moved to a js library.	
	
	*/

	static setStyle(element, style = undefined) {
		if (style == undefined) return;

		for (let p of Object.keys(style)) {
			element['style'][p] = style[p];
		}
	}


	static addChildren(parent, children) {
		if (children == undefined) return;
		if (parent == undefined) return;


		if (!Array.isArray(children)) {
			parent.appendChild(children);
		}
		else {
			for (let element of children) {
				if (Array.isArray(element))
					ui.addChildren(parent, element);

				else {
					parent.appendChild(element);
				}

			}
		}
	}

	static addAttributesTo(target, attributes) {

		if (attributes == undefined) {
			return
		}
		for (let p of Object.keys(attributes))

			if (p.trim() != 'children') {
				if (p.trim() == 'innerHTML') target.innerHTML = attributes[p];
				else target.setAttribute(p, attributes[p])
			}

	}


	static old_table(id, items, table_attributes = undefined, header_attributes = undefined) {
		//The table header columns are all the keys in the items object (a dictionary)
		//we put all these keys in a set so they arent repeated. 

		//create the table, its header row and append the table to a parent element
		let table = document.createElement('table');
		ui.addAttributesTo(table, table_attributes);
		table.setAttribute('id', id);

		//main click event 
		table.raise_click_event = function (data) {
			let x = new CustomEvent("clicked", { bubbles: true, detail: data });
			this.dispatchEvent(x);
		}


		let thead = document.createElement('thead');
		ui.addAttributesTo(thead, header_attributes)

		table.appendChild(thead);
		table.head = thead;

		table.setData = function (data) {

			let head = table.head;
			head.innerHTML = "";

			let table_columns = new Set()
			data.forEach((element) => {
				Object.keys(element).forEach((one) => { table_columns.add(one); });
			});


			table_columns.forEach((column) => {
				head.appendChild(document.createElement("th")).appendChild(document.createTextNode(column));
			});

			//create the rows 
			let s = Array.from(table_columns);
			data.forEach((item) => {           //for each item in the json

				let counter = 0;
				let row = table.insertRow(-1); //add a row at the end 
				//ui.addAttributesTo(row,{class:'active'});

				s.forEach((key) => {             //for each column name   
					let value = item[key];           //fetch the value for the item (may be undefined)
					let c1 = row.insertCell(counter); //and add the cell to the row. 

					if (value == undefined) c1.innerText = ''  //yet if the value was undefined 
					else c1.innerText = value;                //dont add the string 'undefined' set it to empty 

					counter = counter + 1;
				});
			});


			//now the events 
			let rows = table.rows;
			for (let i = 0; i < rows.length; i++)      //for each row 
			{
				let row = rows[i];

				row.addEventListener('click', (evt) =>   //add a click event 
				{
					//set the class list to selected in this row and delete any selected in sibling rows. 	
					for (let k = 0; k < rows.length; k++) {
						rows[k].classList.remove('selected');
					}

					rows[i].classList.add('selected');

					const cell = evt.target.closest('td');
					if (!cell) { return; }// not clicked on a cell

					let cellText = evt.target.innerText;
					let data = { 'row_index': i, 'cell_text': cellText, 'cell_index': cell.cellIndex }
					//these are the event-details 
					//the index of the row and cell clicked.
					//the text in the cell clicked 
					let cells = row.cells;                               //plus the header and the value of each cell for the headers
					for (let n = 0; n < s.length; n++) data[s[n]] = cells[n].innerText;

					//also the number of clickc cummulated in the table, the table element itself, the row elelemnt and the cell eleemnt 
					table.nClicks += 1
					data['nclicks'] = table.nClicks;

					data['table_element'] = table;
					data['row_element'] = row;
					data['cell_element'] = cell;
					table.raise_click_event(data);
				});
			}

			//the table basic properties, such as num rows, header column names, etc...
			table.numRows = table.rows.length;
			table.nClicks = 0
			table.headerColumnNames = Array.from(table_columns);
		}//set data 


		table.setData(items);

		return table;
	}


	static hx(id, size = 1, text = undefined, attributes = undefined) {
		let title_header = document.createElement('h' + size.toString());
		title_header.textContent = text;
		title_header.setAttribute('id', id);
		return title_header
	}

	static h1(id, text, attributes = undefined) {
		return ui.hx(id, 1, text, attributes);
	}

	static h2(id, text, attributes = undefined) {
		return ui.hx(id, 2, text, attributes);
	}














	/*static element( id, tag, attributes = undefined , style = undefined){
		let y = document.createElement( tag );
		y.setAttribute("id", id );
		
		ui.addAttributesTo( y, attributes );// e.g. "for", "male");
		ui.setStyle( y, style );
		return y;	
		
	}*/


	static xxxcheckbox(id, label, checked = false, attributes = undefined, style = undefined) {

		let chk = document.createElement('input');
		chk.setAttribute('type', 'checkbox');       // SPECIFY THE TYPE OF ELEMENT.
		chk.setAttribute('id', id);     // SET UNIQUE ID.

		if (checked) chk.setAttribute('checked', true);

		let lbl = document.createElement('label');
		lbl.setAttribute('for', id);
		lbl.setAttribute('style', 'padding-left: 5px');

		let textNode = document.createTextNode(' ' + label);
		lbl.appendChild(textNode)

		ui.addAttributesTo(chk, attributes);
		ui.setStyle(chk, style);

		chk.label = lbl;
		chk.raise = function (data) {
			let x = new CustomEvent("clicked", { bubbles: true, detail: data });
			chk.dispatchEvent(x);
		}

		chk.addEventListener("click", (evt) => {
			data = { 'checked': chk.checked, 'text': label, 'element': chk, 'parent': chk.parentNode };
			chk.raise(data);
		});

		return [chk, lbl];
	}


};





//export{ get_table_data, ui, DataPageView }