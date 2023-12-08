import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Contato from '../entities/Contato';
import {finalize} from 'rxjs/operators' 
import { AngularFireStorage } from '@angular/fire/compat/storage';
//rxjs => operacoes n sincronas, parte de banco
//finalize => so continua a operacao no q o comando de enviar imagem for finalizado

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private PATH : string = 'contatos';

  constructor(private firestore : AngularFirestore, private storage : AngularFireStorage) { }

  read(){
    return this.firestore.collection(this.PATH)
    .snapshotChanges();
  }

  create(contato: Contato){
    return this.firestore.collection(this.PATH)
    .add({nome: contato.nome, telefone: contato.telefone});
  }

  createWithAvatar(contato: Contato){
    return this.firestore.collection(this.PATH)
    .add({nome: contato.nome, telefone: contato.telefone, downloadURL : contato.downloadURL});
  }

  update(contato: Contato, id: string){
    return this.firestore.collection(this.PATH).doc(id)
    .update({nome: contato.nome, telefone: contato.telefone});
  }

  updateWithAvatar(contato: Contato, id: string){
    return this.firestore.collection(this.PATH).doc(id)
    .update({nome: contato.nome, telefone: contato.telefone, downloadURL : contato.downloadURL});
  }

  delete(contato: Contato){
    return this.firestore.collection(this.PATH)
    .doc(contato.id)
    .delete()
  }

  uploadImage(imagem: any, contato: Contato){
    const file = imagem.item(0);
    if(file.type.split('/')[0] != 'image'){ //split => separa a imagem em varios arrays
      console.error('Tipo não Suportado!'); //garante q sera enviado apenas imagens
      return;
    }

    const path =`images/${contato.nome}_${file.name}`; // caminho da imagem
    const fileRef = this.storage.ref(path); // pega a referencia da imagem
    let task = this.storage.upload(path,file); // tarefa q armazena o envio da imagem
    task.snapshotChanges().pipe(
      finalize(() =>{
        let uploadFileURL = fileRef.getDownloadURL(); //n garante a resposta
        uploadFileURL.subscribe(resp => { //subscribe => quebra o retorno 'resp'
          contato.downloadURL = resp; // pega a resposta e armazanea naquele contato
          if(!contato.id){ // se o contato n existe
            this.createWithAvatar(contato); // cria o contato 
          }else{
            this.updateWithAvatar(contato, contato.id);
          }
        })
      })
      ).subscribe(); //envia a imagem pro banco

  }
}
