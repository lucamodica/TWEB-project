let login = {
    mixins: [validations_funcs],
    template:
        `
        <div class="container ftco-section">
            <div class="row justify-content-center">
                <div class="col-md-6 text-center mb-3">
                    <h2 class="heading-section">Benvenut* su Lesson Booking!</h2>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="login-wrap px-4 px-md-5 py-3 py-md-4">
                        <div class="icon d-flex align-items-center justify-content-center">
                            <i class="ri-account-circle-line ri-xl text-white"></i>
                        </div>
            
                        <h3 class="text-center mb-4">Hai un account?</h3>
            
                        <form class="login-form needs-validation">
                            <div class="form-group">
                                <input type="text" class="form-control rounded-left"
                                       placeholder="Account" id="account" required>
                                <div class="invalid-feedback">
                                    Per accedere, inserisci uno username.
                                </div>
                            </div>
                            <div class="form-group">
                                <input type="password" class="form-control rounded-left"
                                       placeholder="Password" id="pass" required>
                                <div class="invalid-feedback">
                                    Per accedere, inserisci una password.
                                </div>
                            </div>
                            <div class="form-group text-center">
                                <button type="button" class="btn btn-primary rounded
                                            submit p-3 px-5" id="authBtn" 
                                            @click="isValidated = validate_fields($event), login('auth')">
                                            Accedi</button>
                            </div>
                            <div class="form-group text-center">
                                <button type="button" class="btn btn-success rounded
                                            submit p-3 px-5" id="guestBtn" 
                                            @click="login('guest')">
                                            Accedi come ospite</button>
                            </div>
                        </form>
                      
                        <p id="result-msg" class="text-center"></p>
                    </div>
                </div>
             </div>
        </div>
         `,

    methods: {

        //Funcs for adding/removing "required" attr from fields
        addRequiredFields: function(){
            $('#l_account').prop('required', true);
            $('#l_pass').prop('required', true);
        },
        removeRequiredFields: function(){
            $('#l_account').prop('required', false);
            $('#l_pass').prop('required', false);
        },

        //Func to update profie data after a successful login
        loginSucc(account, role) {
            profile.account = account;
            profile.role = role;
            profile.logged = true;

            Cookies.set("account", account);
            Cookies.set("role", role);
            Cookies.set("logged", profile.logged);

            router.push('/');
        },

        //Funcs to generate msg, based on the json response
        succMsg(msgObj, jsonResponse){
            msgObj.removeClass("text-danger");
            msgObj.addClass("text-success");
            msgObj.html(
                "Login avvenuto con successo! (" +
                ((jsonResponse.user.role !== "ospite") ?
                    ("utente " + jsonResponse.user.account) + ", " : '')
                + "ruolo: " + jsonResponse.user.role + ")"
            );

            let self = this;
            setTimeout(() =>
                { self.loginSucc(jsonResponse.user.account,
                    jsonResponse.user.role); },
                1000
            );
        },
        failMsg(msgObj, jsonResponse){
            msgObj.removeClass("text-success");
            msgObj.addClass("text-danger");

            msgObj.html("Login fallito. ");
            switch (jsonResponse.result) {
                case "already_logged":
                    msgObj.append("Risulta un altro utente (o sessione) gia attiva.");
                    break;

                case "invalid_action":
                    msgObj.append("Il tipo azione non è corretta, accertati che sia " +
                        "di tipo 'guest' o 'auth'!");
                    break;

                case "illegal_credentials":
                    msgObj.append("Delle credenziali non sono state inserite.");
                    break;

                case "invalid_credentials":
                    msgObj.append("Le credenziali inserite non sono corrette.");
                    break;

                default:
                    msgObj.append("Ragione: sconosciuta.");

            }

            setTimeout(() =>
                { msgObj.html(''); },
                2000
            );
        },

        //Login func
        login(action){
            let self = this;

            if (action === 'guest' || self.isValidated){
                let acc = '';
                let pass = '';

                //Get login parameters (for auth action)
                if (action === 'auth'){
                    acc = $("#account").val();
                    pass = $("#pass").val();
                }

                //Remove form control, if the type of login is 'guest'
                if (action === 'guest'){
                    $('.needs-validation').removeClass('was-validated');
                }

                $.post("login", {account: acc, password: pass,
                    action: action}, function (data) {

                    let jsonResponse = JSON.parse(JSON.stringify(data));
                    console.log(jsonResponse);
                    let msg = $("#result-msg");

                    //Generates result
                    if (jsonResponse.result === "success"){
                        self.succMsg(msg, jsonResponse);
                    }
                    else{
                        self.failMsg(msg, jsonResponse);
                    }

                });
            }
        }
    },
    beforeRouteLeave(to, from) {
        if (!canUserAccess(from, to, profile.logged)){
            this.$router.push('/login');
        }
    },
}
