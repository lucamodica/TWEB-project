
let navbar = {
    mixins: [globals],
    template:
        `
        <div id="navbar">
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <router-link class="navbar-brand" to="/">
                    <i class="ri-book-read-fill ri-lg"></i>
                </router-link>
                <button class="navbar-toggler" type="button" data-toggle="collapse" 
                data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" 
                aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                
                  <ul class="navbar-nav mr-auto">
                    <li class="nav-item" v-if="profile.role == 'amministratore' || profile.role == 'utente'">
                        <router-link class="nav-link" to="/your_lessons">
                            Le tue ripetizioni
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="profile.role == 'amministratore' || profile.role == 'utente'">
                        <router-link class="nav-link" to="/select_course_for_lesson">
                            Crea ripetizione
                        </router-link>
                    </li>
                    <li class="nav-item">
                      <router-link class="nav-link" to="/available_slots?mode=slots">
                        Slot disponibili
                      </router-link>
                    </li>
                  </ul>
                  
                  <div class="dropdown">
                    <a class="nav-link" href="#" id="accountSettings" role="button" 
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <div class="icon d-flex">
                        <i class="ri-account-circle-line ri-xl text-white"></i>
                      </div>
                    </a>
                    <div class="dropdown-menu dropdown-menu-lg-right" aria-labelledby="accountSettings">
                      <h6 class="dropdown-header">
                        <div v-if="profile.role != 'ospite'">{{profile.account}} <br></div>
                        Ruolo: {{profile.role}}
                      </h6>
                      <div class="dropdown-divider"></div>
                      <div v-if="profile.role == 'amministratore'">
                        <router-link class="dropdown-item" to="/manage_teachers">
                            Gestione docenti
                        </router-link>
                        <router-link class="dropdown-item" to="/manage_courses">
                            Gestione corsi
                        </router-link>
                        <router-link class="dropdown-item" to="/manage_affiliations">
                            Gestione affiliazioni
                        </router-link>
                        <router-link class="dropdown-item" to="/all_lessons">
                            Visualizza tutte le lezioni
                        </router-link>
                        <div class="dropdown-divider"></div>
                      </div>
                      
                      <button class="dropdown-item btn-danger" data-toggle="modal"
                        data-target="#logoutModal">Esci</button>
                  
                    </div>
                  </div>
                </div>
                
            </nav>
        
            <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="logoutModalLabel">Logout piattaforma</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div class="modal-body">
                          Sicuro di voler uscire dalla piattaforma?
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-dismiss="modal">
                              Annulla
                          </button>
                          <button type="button" class="btn btn-danger" data-dismiss="modal" @click="logout">
                              Esci
                          </button>
                      </div>
                  </div>
              </div>
            </div>
        </div>
        `,

    methods: {
        logout() {
            let self = this;
            $.get("logout", function (data) {

                let jsonResponse = JSON.parse(JSON.stringify(data));
                console.log(jsonResponse);
                if (jsonResponse.result === "success" ||
                    jsonResponse.result === "no_user"){
                    self.setLogout();
                }
                if (jsonResponse.result === "no_user"){
                    self.notifySessionExpired();
                }
            })
        }
    }

}