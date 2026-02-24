<script lang="ts">
    import Fa from 'svelte-fa'
    import {faFacebook} from "@fortawesome/free-brands-svg-icons";
    import {faInstagram} from "@fortawesome/free-brands-svg-icons";

</script>

<footer class="py-4 text-center text-gray-300 mt-10">
    <div>
        <ul class="flex justify-center mx-auto gap-5 w-full mb-5">
            <li><a href="https://www.facebook.com/events/1877787939642101/"><Fa icon={faFacebook} /></a></li>
            <li><a href="https://www.instagram.com/norwegianopen_wcs?igsh=MTV2MHo4dWJzYXFlbA=="><Fa icon={faInstagram} /></a></li>
        </ul>
    </div>
    <div>
        <ul class="flex justify-center mx-auto gap-5 w-full mb-5">
            <li><a href="/coc">Code of Conduct</a></li>
            <li><a href="/rules">Competition Rules</a></li>
            <li><a href="/toc">Terms & Conditions</a></li>
        </ul>
    </div>
    <p>© 2026 Norwegian Open WCS | All Rights Reserved</p>
</footer>

<style>
    a {
        text-decoration: underline;
    }
</style>