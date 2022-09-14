
let manage_affiliations = {
    mixins: [management_utils],
    template:
        `
        <div id="manage_affiliations">
            <div class="container py-5">
                <!-- Title row -->  
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pt-4 pb-4">
                    <h2>Gestione affiliazioni</h2>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Subtitle row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-4">
                    <h4>Ecco a te l'elenco delle affiliazioni esistenti</h4>
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
                        Afffiliazione creata!
                    </div>
                    <!-- Alerts for delete action -->
                    <div v-show="del_info.isActionDel">
                        <!-- Alert delete success -->
                        <div class="alert alert-danger alert_notify m-3" 
                            role="alert" v-if="del_info.resultJsonDel == 'success'">
                            Affiliazione eliminata!
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
                        <div v-if="noItems">Nessuna affiliazione presente.</div>
                        <table v-else class="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">Docente</th>
                                    <th scope="col">Corso</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in items">
                                    <td>{{item.name}} {{item.surname}} ({{item.teacher_id}})</td>
                                    <td>{{item.course_title}}</td>
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
                    rounded-circle btnAdd p-3 m-4" data-toggle="modal" data-target="#createAffiliation">
                        <i class="ri-add-line ri-lg" data-toggle="tooltip" data-placement="top" 
                        title="Aggiungi affiliazione"></i>
                    </button>
                  </div>
                </div>
            </div>
            
            <!-- Creation modal -->
            <div class="modal fade" id="createAffiliation" tabindex="-1" role="dialog" 
            aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="logoutModalLabel">Aggiungi affiliazione</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div class="modal-body">
                          Inserisci i seguenti dati richiesti:
                          <form class="needs-validation">
                              <div class="form-group">
                                <label for="course" class="col-form-label">Corso:</label>
                                <select class="form-control" id="course" required>
                                    <option selected></option>
                                    <option v-for="course in courses.items" :value="course.title">
                                        {{course.title}}
                                    </option>
                                </select>
                                <div class="invalid-feedback">
                                    Inserire un corso.
                                </div>
                              </div>
                              <div class="form-group">
                                <label for="teacher" class="col-form-label">Docente:</label>
                                <select class="form-control" id="teacher" required>
                                    <option selected></option>
                                    <option v-for="(teacher, index) in teachers.items" :value="index">
                                        {{teacher.name}} {{teacher.surname}} ({{teacher.id_number}})
                                    </option>
                                </select>
                                <div class="invalid-feedback">
                                    Inserire un docente.
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

    data() {
        return {
            teachers: {
                items: [],
                resultJsonFetch: ""
            },
            courses: {
                items: [],
                resultJsonFetch: ""
            }
        }
    },

    methods: {
        fetchAll(dataType, collection){
            let self = this;
            $.get('selectTable', {objType: dataType}, function (data) {

                let jsonResponse = JSON.parse(JSON.stringify(data));
                collection.resultJsonFetch = jsonResponse.result;
                console.log(jsonResponse);

                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                else if (jsonResponse.result === "success"){
                    jsonResponse.content.forEach(item =>
                        collection.items.push(item)
                    );

                    if (dataType === "affiliazione"){
                        self.fetchAll("corso",self.courses);
                    }
                    else if (dataType === "corso"){
                        self.fetchAll("docente",self.teachers);
                    }

                }
            })
        },
        delete(index) {
            let self = this;
            self.isWaitingNotify = true;

            let affiliation = self.items[index];
            $.get('delete', {objType: "affiliazione", teacher: affiliation.teacher_id,
                course: affiliation.course_title},
                function (data) {

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
                let index_teacher = $("#teacher");
                let course = $("#course");


                self.isWaiting = true;
                let teacher = self.teachers.items[index_teacher.val()];
                $.post('insert', {objType: "affiliazione", teacher_id: teacher.id_number,
                    course_title: course.val()}, function (data) {

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
                        let newAffiliation = {
                            course_title: course.val(),
                            name: teacher.name,
                            surname: teacher.surname,
                            teacher_id: teacher.id_number
                        };

                        self.items.push(newAffiliation);
                        $( "#createAffiliation" ).modal( "hide");
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
    },

    created() {
        //Fetch all affiliations, teachers and courses
        let self = this;
        self.fetchAll("affiliazione",self);
    }
}