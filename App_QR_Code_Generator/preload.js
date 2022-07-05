//vamos importar o que precisamos
//library de javascript que gera códigos QR usando o canvas
//o canvas é um elemento html que permite gerar gráficos numa página web
const QRious = require("qrious/dist/qrious");
//library de javascript que lê códigos QR
//recebe imagens raw e localiza, extrai e dá parse de qualquer código QR dentro delas
const jsQR = require("jsqr/dist/jsQR");
//o ipcRenderer vai-nos permitir emitir sinals para comunicar com a [main]
const {ipcRenderer} = require("electron");

//criar variáveis
let properties_section;
let canvas;
let title;
let bottom;
let ctx;

//criar variáveis para indicar o tamanho do código QR
//as medidas vieram da maneira como o QRious é configurado
const size = 500;
const padding = ((size/10) * 2); 
const full_size = size + padding;

//chamamos esta função que nos permite executar uma função quando a página estiver pronta
window.addEventListener('DOMContentLoaded', () => {
    //vamos usar a [properties_section] para gravar a referência do bloco [section] com
    //a classe [properties-section]
    properties_section = document.getElementsByClassName("properties-section")[0];
    //agora vamos gravar na [title] a referência do campo input <text> com o id "title"
    title = document.getElementById("title");
    //mesma coisa mas com o id "bottom"
    bottom = document.getElementById("bottom");
    //outra vez a mesma coisa mas com o id "canvas" (atenção que não é um input, é um elemento)
    canvas = document.getElementById("canvas");
    //agora vamos usar a [ctx] para gravar nela a referência obtida pela função que recebe o contexto
    ctx = canvas.getContext('2d');

    //vamos adicionar variáveis pelos botões que criámos e passar-lhes a referência dos botões
    //também lhes vamos adicionar os eventos aka o que acontece quando clicamos nos botões
    let add_button = document.getElementById("Add");
    add_button.addEventListener("click", AddSection);

    let remove_button = document.getElementById("Remove");
    remove_button.addEventListener("click",RemoveSection);

    let image_button = document.getElementById("Image");
    image_button.addEventListener("click",CreateImage);

    let check_button = document.getElementById("Check");
    check_button.addEventListener("click",CheckImage);

    let save_button = document.getElementById("Save");
    save_button.addEventListener("click",Save);
});

//função para adicionar campos de texto onde podemos adicionar os dados (data) que
//vão ser incluidos  no código QR aka Botão Add/Adicionar
let AddSection = function(){
    //criar variáveis e associar elementos
    let div = document.createElement("div");
    let p1 = document.createElement("p");
    let label1 = document.createElement("label");
    //configurar as variáveis
    label1.setAttribute("for","name");
    label1.innerText = "Name:"
    let input1 = document.createElement("input");
    input1.type = "text";
    input1.name = "name";
    input1.className = "name";
    //vamos adicionar label1 e input1 a p1
    p1.appendChild(label1);
    p1.appendChild(input1);

    //mesma coisa mas para p2
    let p2 = document.createElement("p");
    let label2 = document.createElement("label");
    label2.setAttribute("for","value");
    label2.innerText = "Value:";
    let input2 = document.createElement("input");
    input2.type = "text";
    input2.name = "value";
    input2.className = "value";
    p2.appendChild(label2);
    p2.appendChild(input2);

    //agora adicionamos p1 e p2 a div
    div.appendChild(p1);
    div.appendChild(p2);

    //adicionamos o div a properties_section
    properties_section.appendChild(div);
}

//função para remover dados que vão ser incluidos no código QR
//aka Botão Remove/Remover
let RemoveSection = function(){
    //criar a variável na qual vamos associar a referência de todos os blocos [div] que
    //estiverem dentro da [properties_section]
    let elements = properties_section.getElementsByTagName("div");
    //vamos verificar que a [elements] contem efetivamente elements
    if(elements.length){
        //se tiver elementos, eliminamos o último elemento dentro dos elementos
        elements[elements.length - 1].remove();
    }
}

//função que nos vai permitir criar o código QR em si 
//aka Botão Image/Imagem
let CreateImage = function(){
    //criamos a variável data e indicamos que vai ser um objeto
    let data = {};
    //criamos um loop for que vai percorrer todos os blocos [div] dentro
    //do [properties_section]
    for (let child of properties_section.getElementsByTagName("div")){
        //criamos uma variável "name" à qual vamos associar a referência
        //ao elemento [input] com o nome de classe [name]
        let name = child.getElementsByClassName("name")[0];
        //mesma coisa mas para o elemento com o nome de classe "value"
        let value = child.getElementsByClassName("value")[0];
        //agora vamos usar os valores destas duas variáveis anteriores
        //para criar dinâmicamente as propriedades do objeto [data] que criámos
        data[name.value] = value.value;
    }
    //vamos limpar os canvas usando a variável [size]
    ctx.clearRect(0, 0, size, size);

    //vamos criar a variável qr e atribuir-lhe o objeto QRious
    let qr = new QRious({
        //a referência ao nosso canvas
        element: canvas,
        //tamanho da imagem que usa por referência a variável [full_size]
        size: full_size ,
        //aqui vamos guardar a informação do código QR
        value: JSON.stringify(data),
        padding: padding,
    });
    //vamos indicar a font e o tamanho dela
    ctx.font = "46px Verdana, sans-serif";
    //vamos meter o texto centrado
    ctx.textAlign = "center";
    //escrever o título nas coordenadas indicadas
    ctx.fillText(title.value, full_size/2, 50);
    //escrever o footer nas coordenadas indicadas
    ctx.fillText(bottom.value, full_size/2, full_size - 20);
}

//função que nos vai permitir verificar os conteúdos do código QR
//aka Botão Check/Verificar
let CheckImage = function(){
    //criar uma variável para guardar a informação dos dados da imagem presentes na ctx
    //deste modos temos uma referência à imagem que contem o código QR
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //criar a variável código e chamar a função à qual vamos passar a variável anterior e
    //o tamanho do canvas
    let code = jsQR(imgData.data, canvas.width, canvas.height);
    //agora a variável [code] deve ter os valores que foram gravados no [properties_section]
    //no momento em que o código QR foi criado
    //caso obtenhamos um resultado da função anterior
    if (code){
        //se sim, usamos o [ipcRenderer] (deixa-nos comunicar com a main) para
        //enviar uma mensagem ao main.js com a informação do código QR
        ipcRenderer.send("message", {message:JSON.stringify(code.data)});
    }
}

//função que nos vai gravar o código QR como uma imagem
//aka Botão Save/Gravar
let Save = function(){
    //dentro desta variável vamos meter o resultado do canvas que vamos
    //transformar em data de URL. Assim podemos gravar a informação como se fosse uma
    //imagem jpg
    let dataURL = canvas.toDataURL('image/jpg', 0.8);
    //agora criamos uma variável onde vamos meter os resultados na variável anterior sem
    //a metadata
    let base64Data = dataURL.replace(/^data:image\/png;base64,/, "");
    //agora vamos usar o ipcRenderer para mandar para a main.js o conteúdo
    //da base64Data. Assim podemos usar a main para gravar a informação como um ficheiro
    ipcRenderer.send("save", {data:base64Data});
}