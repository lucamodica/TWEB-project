
//Const with the global var for a user
const profile = Vue.reactive({
    account: '',
    role: '',
    logged: false
})

//Items of common use
const globals = {
    data() {
        return {
            profile: profile,
            sessionExpired: false,
            isWaiting: false,
            isWaitingNotify: false
        }
    },
    methods: {
        setLogout(){
            Cookies.set("account", this.profile.account = "");
            Cookies.set("role", this.profile.role = "");
            Cookies.set("logged", this.profile.logged = false);

            let body = $("body");
            body.tooltip("hide");

            this.$router.push('/login');
        },
        notifySessionExpired(){
            this.sessionExpired = true;

            setTimeout(() => {
                    this.sessionExpired = false;
                },
                2000
            );
        },
        checkSession(){
            //HTTP request to check if any session is active to the client
            let self = this;
            $.get('checkSession', {}, function (data) {
                let jsonResponse = JSON.parse(JSON.stringify(data));
                console.log(jsonResponse);

                if (jsonResponse.result === "not_logged"){
                    if (self.profile.logged && self.profile.role !== ""){
                        self.notifySessionExpired();
                    }
                    self.setLogout();
                }
            });

            //Assignment of the current global value from cookies
            profile.account = Cookies.get("account");
            profile.role = Cookies.get("role");
            profile.logged = (Cookies.get("logged") === 'true');

            if (!profile.logged) {
                this.$router.push('/login');
            }
        }
    },
    beforeRouteLeave(){
        this.checkSession();
        this.notifySessionExpired();
    }
}

//Global funcs to validate/check fields in a form
const validations_funcs = {
    data(){
        return{
            isValidated: true
        }
    },

    methods: {
        validate_fields(event){
            let forms = $('.needs-validation');
            let isValidated = true;

            // Loop over them and prevent submission
            Array.prototype.filter.call(forms, function(form) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                    isValidated = false;
                }
                form.classList.add('was-validated');
            });

            return isValidated;
        },
        removeValidation(){
            $(".needs-validation").removeClass("was-validated");
        }
    }
}

//Global computed warning messages
const warning_messages = {

    data() {
        return {
            resultJsonFetch: ""
        }
    },

    computed: {
        warnMsgFetch(){
            switch (this.resultJsonFetch) {
                case "no_user":
                    return "Errore, si sta cercando di richiedere " +
                        "l'oggetto mentre nessun utente è attivo.";

                case "invalid_object":
                    return "Errore, si sta cercando di richiedere " +
                        "un oggetto sconosciuto.";

                case "not_allowed":
                    return "Errore, l'utente non ha i permessi per " +
                        "richiedere questo oggetto.";

                case "params_null":
                    return "Errore, alcuni parametri sono nulli o " +
                        "mancanti.";

                case "query_failed":
                    return "Errore di connessione o della richiesta.";

                default:
                    return "Attendere...";
            }
        },
        warnMsgDelete(){
            switch (this.del_info.resultJsonDel){

                case "no_user":
                    return "Errore, si sta cercando di eliminare " +
                        "l'oggetto mentre nessun utente è attivo.";

                case "not_allowed":
                    return "Errore, l'utente non ha il permesso di " +
                        "cancellare l'oggetto.";

                case "invalid_object":
                    return "Errore, si sta cercando di eliminare " +
                        "un oggetto sconosciuto.";

                case "params_null":
                    return "Errore, alcuni valori nulli o mancanti!";

                case "query_failed":
                    return "Errore di connessione o richiesta, <br>" +
                        "l'oggetto potrebbe essere inesistente!";

                case "still_in_lessons":
                    return "Errore, l'oggetto potrebbe essere <br>" +
                        "ancora in una ripetizione attiva!"

                default:
                    return "Attendere...";
            }
        },
        warnMsgCreate(){
            switch (this.cr_info.resultJsonCr){
                case "no_user":
                    return "Errore, si sta cercando di creare <br>" +
                        "l'oggetto mentre nessun utente è attivo.";

                case "invalid_object":
                    return "Errore, si sta cercando di creare <br>" +
                        "un oggetto di tipo sconosciuto.";

                case "not_allowed":
                    return "Errore, l'utente non ha il permesso di " +
                        "creare l'oggetto.";

                case "illegal_params":
                    return "Errore, alcuni valori nulli o mancanti!";

                case "invalid_check":
                    return "Errore, alcuni valori inseriti non sono validi!";

                case "query_failed":
                    return "Errore di connessione o richiesta, <br>" +
                        "l'oggetto potrebbe gia esistere!";

                default:
                    return "Attendere...";
            }
        }
    }
}

//Global funcs/computed data for managements components
const management_utils = {
    mixins: [globals, validations_funcs, warning_messages],
    data() {
        return {
            items: [],
            del_info: {
                isActionDel: false,
                resultJsonDel: "",
            },
            cr_info: {
                isActionCr: false,
                resultJsonCr: "",
            },
        }
    },
    computed: {
        noItems(){
            return this.items.length === 0;
        },
        warnMsgFetch(){
            if (this.resultJsonFetch === "no_user"){
                return "Errore, si sta cercando di richiedere " +
                    "l'oggetto mentre nessun utente è attivo.";
            }
            else if(this.resultJsonFetch === "invalid_object"){
                return "Errore, si sta cercando di richiedere " +
                    "un oggetto sconosciuto.";
            }
            else if (this.resultJsonFetch === "query_failed"){
                return "Errore di connessione o della richiesta."
            }
            return "Attendere...";
        },
        warnMsgDelete(){
            let self = this;
            switch (self.del_info.resultJsonDel){

                case "no_user":
                    return "Errore, si sta cercando di eliminare " +
                        "l'oggetto mentre nessun utente è attivo.";

                case "not_allowed":
                    return "Errore, l'utente non ha il permesso di " +
                        "cancellare l'oggetto.";

                case "invalid_object":
                    return "Errore, si sta cercando di eliminare " +
                        "un oggetto sconosciuto.";

                case "params_null":
                    return "Errore, alcuni valori nulli o mancanti!";

                case "query_failed":
                    return "Errore di connessione o richiesta, <br>" +
                        "l'oggetto potrebbe essere inesistente!";

                case "still_in_lessons":
                    return "Errore, l'oggetto potrebbe essere <br>" +
                        "ancora in una ripetizione attiva!"

            }
            return "Attendere...";
        },
        warnMsgCreate(){
            let self = this;
            switch (self.cr_info.resultJsonCr){
                case "no_user":
                    return "Errore, si sta cercando di creare <br>" +
                        "l'oggetto mentre nessun utente è attivo.";

                case "invalid_object":
                    return "Errore, si sta cercando di creare <br>" +
                        "un oggetto di tipo sconosciuto.";

                case "not_allowed":
                    return "Errore, l'utente non ha il permesso di " +
                        "creare l'oggetto.";

                case "illegal_params":
                    return "Errore, alcuni valori nulli o mancanti!";

                case "invalid_check":
                    return "Errore, alcuni valori inseriti non sono validi!";

                case "query_failed":
                    return "Errore di connessione o richiesta, <br>" +
                        "l'oggetto potrebbe gia esistere!";
            }
            return "Attendere...";
        }
    },
    methods: {
        fetchData(dataType, items){
            let self = this;
            $.get('selectTable', {objType: dataType}, function (data) {

                let jsonResponse = JSON.parse(JSON.stringify(data));
                self.resultJsonFetch = jsonResponse.result;
                console.log(jsonResponse);

                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                else if (jsonResponse.result === "success"){
                    jsonResponse.content.forEach(item =>
                        items.push(item)
                    );
                }
            })
        },
        preventNotification() {
            let self = this;
            self.cr_info.isActionCr = false;
            self.del_info.isActionDel = false;
        }
    }
}


//Func to check if a user can access a specified route
function canUserAccess(from, to, isLogged) {
    return !((to.name === 'login' && isLogged) ||
        (from.name === 'login' && !isLogged));
}