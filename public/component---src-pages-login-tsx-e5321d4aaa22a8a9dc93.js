"use strict";(self.webpackChunkgatsby_starter_default=self.webpackChunkgatsby_starter_default||[]).push([[47],{2493:function(e,t,a){a.r(t);var r=a(7294),n=a(574),c=a(8404);t.default=()=>{const{0:e,1:t}=(0,r.useState)(""),{0:a,1:l}=(0,r.useState)(""),{0:s,1:u}=(0,r.useState)(!1),{0:o,1:i}=(0,r.useState)("");return r.createElement("div",{className:"login-container"},r.createElement("h2",null,"Iniciar Sesión"),r.createElement("form",{onSubmit:async t=>{t.preventDefault(),await c.I8.setPersistence(s?c.wC.auth.Auth.Persistence.LOCAL:c.wC.auth.Auth.Persistence.SESSION),c.I8.signInWithEmailAndPassword(e,a).then((()=>(0,n.navigate)("/"))).catch((e=>{i("Correo o contraseña incorrectos."),console.error(e)}))}},r.createElement("div",{className:"form-group"},r.createElement("label",null,"Correo Electrónico:"),r.createElement("input",{type:"email",value:e,onChange:e=>t(e.target.value),required:!0})),r.createElement("div",{className:"form-group"},r.createElement("label",null,"Contraseña:"),r.createElement("input",{type:"password",value:a,onChange:e=>l(e.target.value),required:!0})),r.createElement("div",{className:"form-group checkbox-group"},r.createElement("input",{type:"checkbox",checked:s,onChange:e=>u(e.target.checked),id:"remember"}),r.createElement("label",{htmlFor:"remember"},"Recuérdame")),r.createElement("button",{type:"submit"},"Iniciar Sesión")),o&&r.createElement("p",{style:{color:"red"}},o))}}}]);
//# sourceMappingURL=component---src-pages-login-tsx-e5321d4aaa22a8a9dc93.js.map