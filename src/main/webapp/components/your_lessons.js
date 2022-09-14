
let your_lessons = {
    mixins: [globals],
    data() {
        return{
            items:[],
            resultJson: "",
            resultJsonUpdate: "",
            isActionUpdate: false
        }
    },

    template:
        ` 
        <div id="your_lessons">
            <div class="container py-5" >
                <!-- Title row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pt-4 pb-4">
                    <h2>Le tue ripetizioni</h2>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Subtitle row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-4">
                    <h4></h4>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Content row -->
                <div class="row">
                  <!-- Notifiation area -->
                  <div class="col-2">
                    <!-- Waiting Alert -->
                    <div class="alert alert-secondary alert_notify m-3" 
                        role="alert" v-show="isWaitingNotify">
                        Attendere...
                    </div>
                    <!-- Alert for update action -->
                    <div class="alert alert_notify m-3" role="alert"
                        :class="{'alert-success': resultJsonUpdate === 'success', 
                        'alert-danger': resultJsonUpdate !== 'success'}"
                        v-show="isActionUpdate" v-html="msgUpdate"></div>          
                  </div>
                  
                  <!-- Content table -->
                  <div class="col-8 text-center pb-5">
                    <div v-if="resultJson == 'success'">
                        <div v-if="this.items.length === 0">Nessuna lezione presente.</div>
                        <table v-else class="table table-striped">
                            <!-- Header -->
                            <thead>
                                <tr>
                                    <th scope="col">Docente</th>
                                    <th scope="col">Ora</th>
                                    <th scope="col">Giorno</th>
                                    <th scope="col">Stato</th>
                                    <th scope="col">Corso</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            
                            <!-- Body -->
                            <tbody>
                                <!--your lessons-->
                                <tr v-for="(rip,index) in items" class="align-middle">
                                    <td>{{rip.name}} {{rip.surname}}</td>
                                    <td>{{rip.t_slot}}</td>
                                    <td>{{rip.day}}</td>
                                    <td>
                                        <span class="badge" :class="statusBadge(rip.status)">
                                            {{rip.status}}
                                        </span>
                                    </td>
                                    <td>{{rip.course}}</td>
                                    <td> 
                                        <button v-if="rip.status==='attiva'"
                                        class="d-flex btn btn-success"  
                                            @click="updateStatus(index,'effettuata')">
                                            <i class="ri-check-line"></i>
                                            Fatto
                                        </button>
                                    </td>
                                    <td>
                                        <button v-if="rip.status==='attiva'" 
                                        class="d-flex btn btn-danger" 
                                            @click="updateStatus(index,'disdetta')">
                                            <i class="ri-close-line"></i>
                                            Disdici
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else>{{warnMsg}}</div>
                  </div> 
                   
                  <div class="col-2"></div>
                </div>
               </div> 
            </div>
        `,

    created() {
        let self=this;
        $.get("selectElems",{objType:"ripetizione", user: self.profile.account},function (data){

            let jsonResponse = JSON.parse(JSON.stringify(data));
            console.log(jsonResponse);
            self.resultJson = jsonResponse.result;
            if (jsonResponse.result === "no_user"){
                self.setLogout();
                self.notifySessionExpired();
            }
            if (self.resultJson === "success"){
                jsonResponse.content.forEach(rip =>
                    self.items.push(rip)
                );
            }
        });
    },

    methods: {

        updateStatus(index, status){
            let self = this;
            let rip = self.items[index];

            self.isWaitingNotify = true;
            $.post("updateLessonStatus",{objType: "ripetizione", teacher: rip.teacher,
                    t_slot: rip.t_slot, day: rip.day, user: self.profile.account,
                    newStatus: status},
                function (data){

                self.isWaitingNotify = false;
                let jsonResponse = JSON.parse(JSON.stringify(data));
                console.log(jsonResponse);

                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                else if (jsonResponse.result === "success"){
                    self.items.splice(index, 1);
                    rip.status = status;
                    self.items.splice(index, 0, rip);
                }

                //Prevent all previous notifications
                self.isActionUpdate = false;

                self.resultJsonUpdate = jsonResponse.result;
                self.isActionUpdate = true;
                setTimeout(() => {
                        self.isActionUpdate = false;
                        self.resultJsonUpdate = "";
                    },
                    2000
                );

            });
        },
        statusBadge(status){
            switch (status){
                case "attiva":
                    return "badge-primary";
                case "effettuata":
                    return "badge-success";
                case "disdetta":
                    return "badge-danger";
                default:
                    return "";
            }
        }

    },

    computed: {
        warnMsg(){
            switch (this.resultJson){
                case "no_user":
                    return "Errore, si sta cercando di richiedere " +
                        "l'oggetto mentre nessun utente è attivo.";

                case "invalid_object":
                    return "Errore, si sta cercando di richiedere " +
                        "un oggetto sconosciuto.";

                case "query_failed":
                    return "Errore di connessione o della richiesta.";

                default:
                    return "Attendere...";
            }
        },
        msgUpdate(){
            switch (this.resultJsonUpdate){
                case "success":
                    return "Stato della lezione aggiornata!";

                case "no_user":
                    return "Errore, si sta cercando di richiedere " +
                        "l'oggetto mentre nessun utente è attivo.";

                case "invalid_object":
                    return "Errore, si sta cercando di richiedere " +
                        "un oggetto sconosciuto.";

                case "not_allowed":
                    return "Errore, l'utente non ha il permesso di " +
                        "creare l'oggetto.";

                case "illegal_params":
                    return "Errore, alcuni valori nulli o mancanti!";

                case "invalid_new_status":
                    return "Errore, il nuovo stato della lezione " +
                        "non è corretto.";

                case "query_failed":
                    return "Errore di connessione o della richiesta.";

                default:
                    return "Attendere...";
            }
        }
    }
}
