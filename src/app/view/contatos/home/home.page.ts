import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Contato from 'src/app/model/entities/Contato';
import { AuthService } from 'src/app/model/services/auth.service';
import { FirebaseService } from 'src/app/model/services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public lista_contatos : Contato[] = [];

  constructor(private firesabe : FirebaseService,
    private router : Router,
    private auth : AuthService) {

      console.log(this.auth.getUserLogged())
      this.firesabe.read()
      .subscribe(res => {
        this.lista_contatos = res.map(contato =>{
          return{
            id: contato.payload.doc.id,
            ... contato.payload.doc.data() as any
          }as Contato;
        })
      })
    }


  irParaCadastrar(){
    this.router.navigate(["/cadastrar"]);
  }

  editar(contato : Contato){
    this.router.navigateByUrl("/detalhar", {state : {contato:contato}});
  }

  logout(){
    this.auth.signOut().then((res)=>{
      this.router.navigate(["signin"]);
    })
  }

}
