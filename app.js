xComics = function(id, src, arrLang, data){
    this.body = document.getElementById(id);
    this.body.style.position = 'relative';
    this.src = src;
    this.aL = arrLang;
    this.startLang = this.aL[0].local;
    this.data = data;

    this.controls = null;
    this.imgArea = null;
    this.lang = null;

    this.textItems = new Array();

    this.createAppAreas();
    this.mountImg();
    this.createControls();
    this.controlsEvent();
    this.editTable();

    this.mountText();
    this.mountApp = true;

    this.editText();
    this.grabnDrop();

    this.resizeBlock();
    window.xcomics = this;
}
xComics.prototype.createAppAreas = function(){
    this.controls = document.createElement('div');
    this.controls.id = 'xakplControls';
    this.controls.style.position = 'fixed';
    this.controls.style.zIndex = '2';
    this.body.appendChild(this.controls);

    this.imgArea = document.createElement('div');
    this.imgArea.id = 'xakplImgArea';
    this.imgArea.style.position = 'relative'
    this.body.appendChild(this.imgArea);
}
xComics.prototype.mountImg = function(){
    let img = new Image();
    img.src = this.src;
    img.style.maxWidth = '100%';
    this.imgArea.appendChild(img);
    img.addEventListener('load', ()=>{
        this.getAreaSize();
    })
}
xComics.prototype.getAreaSize = function(){
    this.Area = this.imgArea.getBoundingClientRect();
    return this;
}
xComics.prototype.createControls = function(){
    this.aL.map((l)=>{
        let btn = document.createElement('button');
        btn.setAttribute('data-lang', l.local);
        btn.setAttribute('data-type', 'show');
        btn.textContent = l.name;
        this.controls.appendChild(btn);
    });

    this.aL.map((l)=>{
        let btn = document.createElement('button');
        btn.setAttribute('data-lang', l.local);
        btn.setAttribute('data-type', 'add');
        btn.textContent = `Добавить ${l.name}`;
        this.controls.appendChild(btn);
    });
}
xComics.prototype.controlsEvent = function(){
    this.controls.addEventListener('click', (e)=>{
        if(e.target.tagName === 'BUTTON'){
            let payload = e.target.getAttribute('data-type');
            if(payload === 'show'){
                let lang = e.target.getAttribute('data-lang');
                this.createTextElement(lang);
            }
            if(payload === 'add'){
                let lang = e.target.getAttribute('data-lang');
                this.createNewElement(lang);
            }
            return;
        }
    });
}
xComics.prototype.mountText = function(){
    if(this.lang === null){
        this.createTextElement(this.startLang);
    } else {
        this.createTextElement(this.lang);
    }
}
xComics.prototype.createTextElement = function(l){

    if(this.textItems.length !== 0){
        Array.from(this.imgArea.querySelectorAll('div')).map((e)=>{
            e.remove();
        });
    }
    if(this.data[l] ===  undefined){
        return;
    }
    this.data[l].map((d, i)=>{
        let el = document.createElement('div');
        el.innerHTML = d.textContent;

        let w = document.createElement('div');
        w.appendChild(el);


        w.style.position = 'absolute';
        el.style.backgroundColor = 'white';

        let style = Object.keys(d.style);
        style.map((s)=>{
            if(s !== 'top' && s !== 'left'){
                el.style[s] = d.style[s];
            }

        });

        w.style.top = d.style.top;
        w.style.left = d.style.left;

        el.style.border = 'solid 2px red';
        el.setAttribute('data-lang', l);
        el.setAttribute('data-type', 'text');
        el.setAttribute('data-id', i);

        let er = document.createElement('div');
        er.classList.add('block_resize');

        w.appendChild(er);

        this.imgArea.appendChild(w);
        this.textItems.push(w);
    });
    this.lang = l;
}
xComics.prototype.editText = function(){
    this.imgArea.addEventListener('contextmenu', (e)=>{
        e.preventDefault();
        if(e.target.tagName === 'DIV' && e.target.getAttribute('data-type') === 'text'){
            let el = e.target;
            let id = e.target.getAttribute('data-id');
            let lang = e.target.getAttribute('data-lang')
            let itemDataObject = this.data[lang][id];
            let style = this.data[lang][id].style;
            let text = this.data[lang][id].textContent;

            this.imgArea.removeChild(el.parentElement);

            let w = document.createElement('div');
            w.style.position = 'absolute';
            w.style.top = style.top;
            w.style.left = style.left;
            this.imgArea.appendChild(w);

            let t = document.createElement('textarea');
            t.style.display = 'block';
            let k = Object.keys(style);
            k.map((s)=>{
                if(s !== 'top' && s !== 'left'){
                    t.style[s] = style[s];
                }
            });
            t.value = el.innerHTML;
            w.appendChild(t);

            let r = document.createElement('div');
            r.innerHTML = this.dataRedactor;
            let inpts = r.querySelectorAll('input, select');
            inpts = Array.from(inpts);
            inpts.map((i)=>{
                i.value = style[i.name];
            });
            w.appendChild(r);

            r.addEventListener('change', (e)=>{
                inpts.map((i)=>{
                    style[i.name] = i.value;
                    t.style[i.name] = i.value;
                });
                console.log(style);
            }, false);


            let btn = r.querySelector('button');
            btn.addEventListener('click', (e)=>{
                itemDataObject.textContent = t.value.replace(/\n/g, "<br />");
                style.height = t.offsetHeight + 'px';
                style.width = t.offsetWidth + 'px';
                inpts.map((i)=>{
                    style[i.name] = i.value;
                    t.style[i.name] = i.value;
                });
                this.createTextElement(lang);
                w.remove();
            }, false);



        }
    });

    console.log(this);
}


xComics.prototype.editTable = function(){

    let str = '<table><tbody>';

    let schema = [
        {alias: 'Шрифт', tagName: 'select', jsKey: 'fontFamily', values: ['Comics Sans', 'Arial', 'Times New Roman']},
        {alias: 'Поворот', tagName: 'input', jsKey: 'transform', values: 'rotate(0deg)'},
        {alias: 'Толщина шрифта', tagName: 'select', jsKey: 'fontWeight', values: ['100', '200', '300', '400', '500', '600', '700', '800', '900']},
        {alias: 'Высота строки', tagName: 'select', jsKey: 'lineHight', values: ['1', '1.5', '2']},
        {alias: 'Трансормация текста', tagName: 'select', jsKey: 'textTransform', values: ['uppercase', 'capitalize', 'lowercase']},
        {alias: 'Выравнивание', tagName: 'select', jsKey: 'textAlign', values: ['center', 'right', 'left']},
        {alias: 'Паддинг', tagName: 'input', jsKey: 'padding', values: '10px'},
        {alias: 'Размер шрифта', tagName: 'select', jsKey: 'fontSize', values: ['12px', '14px', '18px']},
    ];


    schema.map((o)=>{
        str += '<tr>';
        str += '<td>';
        str += o.alias;
        str += '</td>';
        str += '<td>';

        str += '<td>';
        if(o.tagName === 'input'){
            str += '<input name="'+ o.jsKey +'" value="'+o.values +'" />';
        }
        if(o.tagName === 'select'){
            str += '<select name="'+ o.jsKey +'" />';
            o.values.map((v)=>{
                str += `<option value="${v}">${v}</option>`;
            });
            str += '</select>';
        }
        str += '</td>';
        str += '</tr>';
    });

    str += '</tbody></table>';
    str += '<button>сохранить</button>';
    this.dataRedactor = str;
}
xComics.prototype.openData = function(data){
    let areas = this.dataRedactor.querySelectorAll('input');
    areas = Array.from(areas);
    areas.map((i)=>{
        i.value = data[i.name];
    });
}

xComics.prototype.grabnDrop = function(){

    let area = this.imgArea;
    this.imgArea.addEventListener('mousedown', (e)=>{

        if(e.target.classList.contains('block_resize')){
            return;
        }

        if(e.target.tagName === 'DIV' && e.target.getAttribute('data-type') === 'text'){
            let ball = e.target;

            let itemStyle = this.data[ball.getAttribute('data-lang')][ball.getAttribute('data-id')].style;
            ball = e.target.parentElement;

            ball.onmousedown = function(e) { // 1. отследить нажатие  var coords = getCoords(ball);
                var coords = getCoords(ball);
                var shiftX = e.pageX - coords.left;
                var shiftY = e.pageY - coords.top;

                ball.style.position = 'absolute';
                // document.body.appendChild(ball);
                moveAt(e);

                function moveAt(e) {
                    ball.style.left = e.pageX - shiftX + 'px';
                    ball.style.top = e.pageY - shiftY + 'px';
                }
                document.onmousemove = function(e) {
                    moveAt(e);
                };
                ball.onmouseup = function() {
                    document.onmousemove = null;
                    ball.onmouseup = null;

                    ball.onmousedown = null;

                    area.appendChild(ball);
                    itemStyle.top = ball.style.top;
                    itemStyle.left = ball.style.left;
                };

            }
            ball.ondragstart = function() {
                return false;
            };

            function getCoords(elem) {   // кроме IE8-
                var box = elem.getBoundingClientRect();
                return {
                    top: box.top + pageYOffset,
                    left: box.left + pageXOffset
                };
            }


        } else {
            return;
        }

    }, false);
}

xComics.prototype.createNewElement = function(l){
    if(this.lang === l){
        this.createItem(l);
        this.createTextElement(l);
    } else {
        this.textItems.map((e)=>{
            e.remove();
        });
        this.createItem(l);
        this.createTextElement(l);
    }
}
xComics.prototype.createItem = function(l){
    let scheme = ['height', 'width', 'fontFamily', 'transform', 'fontWeight', 'lineHight', 'textTransform', 'textAlign', 'padding', 'fontSize'];
    let o = {textContent: 'New tex', style: {}};
    o.style.top = '20px';
    o.style.left = '20px';
    scheme.map((s)=>{
        o.style[s] = '';
    });
    o.style.padding = '3em';
    if(typeof(this.data[l]) === 'object'){
        this.data[l].push(o);
    } else {
        this.data[l] = new Array();
        this.data[l].push(o);
    }
}

xComics.prototype.resizeBlock = function(){
    let data = this.data;
    let imgArea = this.imgArea;
    var ie = 0;
    var op = 0;
    var ff = 0;
    imgArea.addEventListener('mousedown', (e)=>{

        if(e.target.tagName === 'DIV' && e.target.getAttribute('data-type') === 'text'){
            return;
        }

        if(e.target.classList.contains('block_resize')){
            let block  = e.target.previousElementSibling;
            let block_r = e.target





            let itemStyle = data[block.getAttribute('data-lang')][block.getAttribute('data-id')].style;



            document.onmouseup = clearXY; // Ставим обработку на отпускание кнопки мыши
            block_r.onmousedown = saveWH; // Ставим обработку на нажатие кнопки мыши

            /* Функция для получения текущих координат курсора мыши */
            function getXY(obj_event) {
                if (obj_event) {
                    x = obj_event.pageX;
                    y = obj_event.pageY;
                }
                else {
                    x = window.event.clientX;
                    y = window.event.clientY;
                    if (ie) {
                        y -= 2;
                        x -= 2;
                    }
                }
                return new Array(x, y);
            }
            function saveWH(obj_event) {
                var point = getXY(obj_event);
                w_block = block.offsetWidth; // Текущая ширина блока
                h_block = block.offsetHeight; // Текущая высота блока
                delta_w = w_block - point[0]; // Измеряем текущую разницу между шириной и x-координатой мыши
                delta_h = h_block - point[1]; // Измеряем текущую разницу между высотой и y-координатой мыши
                /* Ставим обработку движения мыши для разных браузеров */
                document.onmousemove = resizeBlock;
                // if (op || ff) document.addEventListener("onmousemove", resizeBlock, false);
                return false; // Отключаем стандартную обработку нажатия мыши
            }
            /* Функция для измерения ширины окна */
            function clientWidth() {
                return document.documentElement.clientWidth == 0 ? document.body.clientWidth : document.documentElement.clientWidth;
            }
            /* Функция для измерения высоты окна */
            function clientHeight() {
                return document.documentElement.clientHeight == 0 ? document.body.clientHeight : document.documentElement.clientHeight;
            }
            /* При отпускании кнопки мыши отключаем обработку движения курсора мыши */
            function clearXY() {
                document.onmousemove = null;
                itemStyle.width = block.style.width;
                itemStyle.height = block.style.height;
                console.log(data);
            }
            function resizeBlock(obj_event) {
                var point = getXY(obj_event);
                new_w = delta_w + point[0]; // Изменяем новое приращение по ширине
                new_h = delta_h + point[1]; // Изменяем новое приращение по высоте
                block.style.width = new_w + "px"; // Устанавливаем новую ширину блока
                block.style.height = new_h + "px"; // Устанавливаем новую высоту блока
                /* Если блок выходит за пределы экрана, то устанавливаем максимальные значения для ширины и высоты */
                if (block.offsetLeft + block.clientWidth > clientWidth()) block.style.width = (clientWidth() - block.offsetLeft) + "px";
                if (block.offsetTop + block.clientHeight > clientHeight()) block.style.height = (clientHeight() - block.offsetTop) + "px";
            }

        }
    }, false);
}

