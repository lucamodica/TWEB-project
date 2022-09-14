
let manage_courses = {
    mixins: [management_utils],
    template:
        `
        <div id="manage_courses">
            <div class="container-fluid py-5">
                <!-- Title row -->  
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pt-4 pb-4">
                    <h2>Gestione corsi</h2>
                  </div>
                  <div class="col-sm">
                  </div>
                </div>
                
                <!-- Subtitle row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-4">
                    <h4>Ecco a te l'elenco dei corsi presenti</h4>
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
                        Corso creato!
                    </div>
                    <!-- Alerts for delete action -->
                    <div v-show="del_info.isActionDel">
                        <!-- Alert delete success -->
                        <div class="alert alert-danger alert_notify m-3" 
                            role="alert" v-if="del_info.resultJsonDel == 'success'">
                            Corso eliminato!
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
                        <div v-if="noItems">Nessun corso presente.</div>
                        <table v-else class="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">Titolo</th>
                                    <th scope="col">Descrizione</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in items">
                                    <td>{{item.title}}</td>
                                    <td>{{item.desc}}</td>
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
                    rounded-circle btnAdd p-3 m-4" data-toggle="modal" data-target="#createCourse">
                        <i class="ri-add-line ri-lg" data-toggle="tooltip" data-placement="top" 
                        title="Aggiungi corso"></i>
                    </button>
                  </div>
                  
                </div>
            </div>
            
            <!-- Creation modal -->
            <div class="modal fade" id="createCourse" tabindex="-1" role="dialog" 
            aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="logoutModalLabel">Aggiungi corso</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div class="modal-body">
                          Inserisci i seguenti dati richiesti:
                          <form class="needs-validation">
                              <div class="form-group">
                                <label for="title" class="col-form-label">Titolo:</label>
                                <input type="text" class="form-control" id="title" 
                                placeholder="Titolo" required>
                                <div class="invalid-feedback">
                                    Inserire un titolo.
                                </div>
                              </div>
                              <div class="form-group">
                                <label for="desc" class="col-form-label">Descrizione:</label>
                                <input type="text" class="form-control" id="desc" 
                                placeholder="Descrizione" required>
                                <div class="invalid-feedback">
                                    Inserire una descrizione.
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
        //Fetch all courses
        let self = this;
        self.fetchData("corso", self.items);
    },

    methods: {
        delete(index) {
            let self = this;
            self.isWaitingNotify = true;

            let course = self.items[index];
            $.get('delete', {objType: "corso", title: course.title}, function (data) {

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
                let title = $("#title");
                let desc = $("#desc");

                self.isWaiting = true;
                $.post('insert', {objType: "corso", title: title.val(),
                        desc: desc.val()}, function (data) {

                    self.isWaiting = false;
                    let jsonResponse = JSON.parse(JSON.stringify(data));
                    console.log(jsonResponse);

                    if (jsonResponse.result === "no_user"){
                        self.setLogout();
                        self.notifySessionExpired();
                    }
                    //If the create was a success, it'll be
                    //removed from the items array
                    else if (jsonResponse.result === "success") {
                        self.items.push(jsonResponse.obj);
                        $( "#createCourse" ).modal( "hide");
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