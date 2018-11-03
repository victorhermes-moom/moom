$(document).ready(function() {
/*// Mantém os inputs em cache:
var inputs = $('#email');

// Chama a função de verificação quando as entradas forem modificadas
// Usei o 'change', mas 'keyup' ou 'keydown' são também eventos úteis aqui
inputs.on('keyup', verificarInputs);

function verificarInputs() {
    var preenchidos = true;  // assumir que estão preenchidos
    inputs.each(function () {
        // verificar um a um e passar a false se algum falhar
        // no lugar do if pode-se usar alguma função de validação, regex ou outros
        if (!this.value) {
          preenchidos = false;
          // parar o loop, evitando que mais inputs sejam verificados sem necessidade
          return false;
        }
    });
    // Habilite, ou não, o <button>, dependendo da variável:
    $('.botao-enviar').prop('disabled', !preenchidos);
}*/

$(document).on('submit', '#form_validator', function(){
      if($('input').find('input[class="valid"]')){
            $('.botao-enviar').text('Aguarde...');
            $('.botao-enviar').prop('disabled', true);
      } else {
            $('.botao-enviar').prop('disabled', false);
            
      }
});

$("#form_validator").validate({
    rules : {
          nome:{
                 required:true,
                 minlength:3
          },
          sobrenome: {
                required:true,
                minlength:3
          },
          email:{
                 required: true,
                 email: true
          },
          password:{
                 required:true,
                 minlength:5,
                 maxlength: 50
          },
          password_again: {
             required: true,
             equalTo: "#password"
          }                                
    },
    messages:{
            nome:{
                 required:"Por favor, informe seu nome",
                 minlength:"O nome deve ter pelo menos 3 caracteres"
            },
            sobrenome:{
                  required:"Por favor, informe seu sobrenome",
                  minlength:"O sobrenome deve ter pelo menos 3 caracteres"
            },
            email:{
                 required:"É necessário informar um email",
                 email: "Insira um e-mail válido"
            },
            password:{
                 required:"Campo senha não pode ficar em branco",
                 minlength: "Senha com no mínimo 5 digitos",
                 maxlength: "Número de caracteres excedido"
            },
            password_again: {
                  required: "Digite a mesma senha do campo acima",
                  equalTo: "Senhas não conferem"
            } 
    }
});
});