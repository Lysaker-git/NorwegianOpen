<script lang="ts">
    import DarkLogo from '$lib/components/logo/nopenDarkLogo.png'
</script>

<header class="flex items-center justify-between px-8 py-6">
    <div class="logo">
        <a href="/">
            <img class="cInvert h-12" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
        </a>
    </div>
    <nav class="hidden md:block">
        <ul class="flex space-x-6">
            <li><a href="/about" class="hover:text-gray-300">About</a></li>
            <li><a href="/schedule" class="hover:text-gray-300">Schedule</a></li>
            <li><a href="#location" class="hover:text-gray-300">Location</a></li>
            <li><a href="#contact" class="hover:text-gray-300">Contact</a></li>
        </ul>
    </nav>
    <div class="md:hidden">
        <button class="text-white focus:ring focus:outline-none">
            <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path
                    fill-rule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
            </svg>
        </button>
    </div>
</header>

<style>
    .cInvert {
		filter: invert(100%);
	}
</style>