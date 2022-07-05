//Ponto de entrada e é o processo Main da aplicação

//Em primeiro lugar importamos a [app], [BrowserWindow], [dialog] e [ipcMain]
const { app, BrowserWindow, dialog, ipcMain } = require("electron");

//a [app] permite-nos controlar o ciclo de vida da aplicação

//a [BrowserWindow] vai permitir-nos criar a janela da aplicação 

//a [dialog] vai permitir-nos mostrar mensagens no ecrã 

//a [ipcMain] vai permitir-nos comunicar com outros processos


//vamos usar o path para nos permitir trabalhar com o path da aplicação
const path = require("path");
//vamos usar o fs para trabalhar com o sistema de ficheiros
const fs = require("fs");

//chamamos esta função para executar uma função quando a aplicação estiver pronta
app.whenReady().then(() => {
    //chamamos a função de criar a janela definida mais abaixo
    createWindow();
    //nas recomendações do Electron dizem-nos para adicionar [app.on(activate)] para prevenir
    //a aplicação de correr com erros no caso do IOS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
    //vamos receber as mensagens do preload que vão ser mostradas no ecrã
    ipcMain.on("message", function(event,arg){
        //vamos mostrar a mensagem no ecrã recebendo o conteúdo que está na [arg.message]
        dialog.showMessageBox({message:arg.message});
    });
    //vamos gravar o código QR como um ficheiro
    ipcMain.on("save", function(event,arg){
        //primeiro a janela de gravar (depende do sistema operativo!)
        //esta função vai retornar [Promise]
        //vamos utilizar uma função para ler o resultado
        dialog.showSaveDialog().then((x) =>{
            //criar uma condição para verificar se dentro do resultado está um ficheiro
            //com um path vazio
            if (!x.filePath.length){
                //se sim, informamamos o user que a operação foi cancelada
                dialog.showMessageBox({message:"Canceled"});
                return;
            }
            //se tudo correr bem aka o user tiver escolhido um ficheiro com um path
            //para gravar a informação
            else{
                //vamos então usar a função WriteFile para gerar o ficheiro
                //passamos o nome do ficheiro, a informação e a indicação de que vamos gravar
                //como base64. Vamos a seguir atribuir uma função para verificar se
                //não ocorreram erros no momento de gravar
                fs.writeFile(x.filePath, arg.data, "base64", function (err) {
                    //vamos criar uma condição para verificar se não ocorreu nenhum erro
                    if(err){
                        //caso tenha occorido um erro, comunicamos através do showMessageBox
                        dialog.showMessageBox({message:err.message});
                    }
                    else{
                        //caso tenha tudo corrido bem, comunicamos através dela também
                        dialog.showMessageBox({message:"Saved"});
                    }
                });
            }
        });
    });
})

//função de criar a janela, utilizada mais acima
const createWindow = () => {
    //criamos a variável mainWindow e damos assign a uma nova BrowserWindow
    const mainWindow = new BrowserWindow({
        //definimos aqui o tamanho
        width: 1200,
        height: 900,
        webPreferences: {
            //damos assign do preload.js a ela. Ele deixa-nos gerir e ordenar o
            // carregamento de assets/data
            preload: path.join(__dirname, 'preload.js')
        },
    });
    //vamos então esconder o menuBar da janela
    mainWindow.setMenuBarVisibility(false);
    //vamos carregar o ficheiro html da página que vai ser utilizada como a UI
    mainWindow.loadFile('index.html');
}

//para ter a CERTEZA de que fechamos a aplicação quando todas as janelas são fechadas
app.on('window-all-closed', () => {
    //se forem fechadas chamamos o [app.quit()]
    if (process.platform !== 'darwin') app.quit()
})