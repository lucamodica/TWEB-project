
let manage_teachers = {
    mixins: [management_utils],
    template:
        `
        <div id="manage_teachers">
            <div class="container py-5">
                <!-- Title row -->  
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pt-4 pb-4">
                    <h2>Gestione docenti</h2>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Subtitle row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-4">
                    <h4>Ecco a te l'elenco dei docenti presenti</h4>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Content row -->
                <div class="row">
                  <!-- Notifiation area -->
                  <div class="col-3">
                    <!-- Waiting Alert -->
                    <div class="alert alert-secondary alert_notify m-3" 
                        role="alert" v-show="isWaitingNotify">
                        Attendere...
                    </div>
                    <!-- Alert create success -->
                    <div class="alert alert-success alert_notify m-3" 
                        role="alert" v-show="cr_info.isActionCr && 
                        cr_info.resultJsonCr == 'success'">
                        Docente creato!
                    </div>
                    <!-- Alerts for delete action -->
                    <div v-show="del_info.isActionDel">
                        <!-- Alert delete success -->
                        <div class="alert alert-danger alert_notify m-3" 
                            role="alert" v-if="del_info.resultJsonDel == 'success'">
                            Docente eliminato!
                        </div> 
                        <!-- Alert delete error -->
                        <div class="alert alert-danger alert_notify m-3" 
                            role="alert" v-else v-html="warnMsgDelete">
                        </div>  
                    </div>           
                  </div>
                  
                  <!-- Content table -->
                  <div class="col-6 text-center pb-5">
                    <div v-if="resultJsonFetch == 'success'">
                        <div v-if="noItems">Nessun docente presente.</div>
                        <table v-else class="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">Matricola</th>
                                    <th scope="col">Nominativo</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in items">
                                    <td>{{item.id_number}}</td>
                                    <td>{{item.name}} {{item.surname}}</td>
                                    <td>
                                        <button class="btn btn-danger align-content-between" 
                                        @click="this.delete(index)">
                                            Elimina
                                            <i class="ri-delete-bin-line ri-lg"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else>{{warnMsgFetch}}</div>
                  </div>
                  
                  <!-- Add button -->
                  <div class="col-3">
                    <button v-if="resultJsonFetch == 'success'" class="btn btn-primary 
                    rounded-circle btnAdd p-3 m-4" data-toggle="modal" data-target="#createTeacher">
                        <i class="ri-add-line ri-lg" data-toggle="tooltip" data-placement="top" 
                        title="Aggiungi docente"></i>
                    </button>
                  </div>
                </div>
            </div>
            
            <!-- Creation modal -->
            <div class="modal fade" id="createTeacher" tabindex="-1" role="dialog" 
            aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="logoutModalLabel">Aggiungi docente</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div class="modal-body">
                          Inserisci i seguenti dati richiesti:
                          <form class="needs-validation">
                              <div class="form-group">
                                <label for="id_number" class="col-form-label">Matricola:</label>
                                <input type="number" class="form-control" id="id_number" 
                                placeholder="Matricola" required>
                                <div class="invalid-feedback">
                                    Inserire un numero di matricola.
                                </div>
                              </div>
                              <div class="form-group">
                                <label for="name" class="col-form-label">Nome:</label>
                                <input type="text" class="form-control" id="name" 
                                placeholder="Nome" required>
                                <div class="invalid-feedback">
                                    Inserire un nome.
                                </div>
                              </div>
                              <div class="form-group">
                                <label for="surname" class="col-form-label">Cognome:</label>
                                <input type="text" class="form-control" id="surname" 
                                placeholder="Cognome" required>
                                <div class="invalid-feedback">
                                    Inserire un cognome.
                                </div>
                              </div>
                          </form>
                          <p class="text-center" v-if="cr_info.isActionCr || isWaiting"
                          :class="{'text-danger': !isWaiting}"
                          v-html="warnMsgCreate"></p>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-dismiss="modal">
                              Annulla
                          </button>
                          <button type="button" class="btn btn-primary" 
                          @click="isValidated = validate_fields($event), this.create()">
                              Aggiungi
                          </button>
                          <br>
                      </div>
                  </div>
              </div>
            </div>
        </div>
        `,

    created() {
        //Fetch all teachers
        let self = this;
        self.fetchData("docente", self.items);
    },

    methods: {
        delete(index) {
            let self = this;
            self.isWaitingNotify = true;

            let teacher = self.items[index];
            $.get('delete', {objType: "docente", id_number: teacher.id_number}, function (data) {

                self.isWaitingNotify = false;
                let jsonResponse = JSON.parse(JSON.stringify(data));
                console.log(jsonResponse);

                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                    //If the delete was a success, it'll be
                //removed from the items array
                else if (jsonResponse.result === "success") {
                    self.items.splice(index, 1);
                }

                //Prevent all previous notifications
                self.preventNotification();

                self.del_info.resultJsonDel = jsonResponse.result;
                self.del_info.isActionDel = true;
                setTimeout(() => {
                        self.del_info.isActionDel = false;
                        self.del_info.resultJsonDel = "";
                    },
                    2000
                );

            });
        },
        create() {
            let self = this;
            if (self.isValidated) {
                let id_number = $("#id_number");
                let name = $("#name");
                let surname = $("#surname");

                self.isWaiting = true;
                $.post('insert', {objType: "docente", id_number: id_number.val(),
                    name: name.val(), surname: surname.val()}, function (data) {

                    self.isWaiting = false;
                    let jsonResponse = JSON.parse(JSON.stringify(data));
                    console.log(jsonResponse);

                    if (jsonResponse.result === "no_user"){
                        self.setLogout();
                        self.notifySessionExpired();
                    }
                        //If the delete was a success, it'll be
                    //removed from the items array
                    else if (jsonResponse.result === "success") {
                        self.items.push(jsonResponse.obj);
                        $( "#createTeacher" ).modal( "hide");
                    }

                    //Prevent all previous notifications
                    self.preventNotification();

                    self.cr_info.resultJsonCr = jsonResponse.result;
                    self.cr_info.isActionCr = true;
                    setTimeout(() => {
                            self.cr_info.isActionCr = false;
                            self.cr_info.resultJsonCr = "";
                        },
                        2500
                    );
                });
            }
        }
    }

}