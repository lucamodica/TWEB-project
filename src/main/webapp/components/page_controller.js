let page_controller = {
    template:
        `
        <navbar></navbar>
        
        <router-view></router-view>
        `,

    beforeRouteLeave(to, from) {

        if (!canUserAccess(from, to, profile.logged)) {
            this.$router.push('/');
        }
    }


}