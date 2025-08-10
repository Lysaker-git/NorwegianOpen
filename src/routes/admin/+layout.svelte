<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';
    let mobileNavOpenAdmin = false;
    let prevPath = '';
    $: if ($page.url.pathname !== prevPath) {
        prevPath = $page.url.pathname;
        mobileNavOpenAdmin = false;
    }
</script>

<div class="mx-8 ">
    <div class="admin-layout min-h-screen flex flex-col bg-gray-900 text-gray-100 rounded shadow--lg">
        <header class="bg-gray-800 shadow-md rounded">
            <nav class="container mx-auto px-6 py-3 flex justify-between items-center relative">
                <a href="/admin" class="text-xl font-bold text-amber-400 hover:text-amber-300">Admin Panel</a>
                <!-- Desktop nav -->
                <div class="hidden md:flex items-center">
                    <a href="/admin/registrations" class="px-4 py-2 rounded bg-amber-500 text-gray-900 font-semibold shadow hover:bg-amber-400 transition-colors duration-150 mr-2">
                        Registrations
                    </a>
                    <a href="/admin/dashboard/hotels" class="px-4 py-2 rounded bg-amber-500 text-gray-900 font-semibold shadow hover:bg-amber-400 transition-colors duration-150 mr-2">
                        Hotel Registrations
                    </a>
                    <a href="/admin/dashboard" class="px-4 py-2 rounded bg-indigo-500 text-white font-semibold shadow hover:bg-indigo-400 transition-colors duration-150">
                        Dashboard
                    </a>
                    {#if $page.data.session && $page.url.pathname === '/admin'}
                        <form 
                            method="POST" 
                            action="?/logout" 
                            class="inline ml-2"
                        >
                        <button type="submit" class="ml-4 px-3 py-2 rounded bg-red-600 hover:bg-red-700">
                            Logout <span class="text-xs">({$page.data.session.user.email?.split('@')[0]})</span>
                        </button>
                    </form>
                    {/if}
                </div>
                <!-- Hamburger for mobile -->
                <button type="button" class="md:hidden flex items-center px-3 py-2 border rounded text-amber-400 border-amber-400 hover:text-amber-300 hover:border-amber-300 focus:outline-none z-50" on:click={() => mobileNavOpenAdmin = !mobileNavOpenAdmin} aria-label="Open admin menu">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <!-- Mobile nav dropdown -->
                {#if mobileNavOpenAdmin}
                <div class="absolute right-0 top-14 z-40 w-56 bg-gray-900 border border-gray-700 rounded shadow-lg flex flex-col md:hidden animate-fade-in pointer-events-auto">
                    <a href="/admin/registrations" class="px-4 py-3 border-b border-gray-700 hover:bg-amber-500 hover:text-gray-900 transition-colors">Registrations</a>
                    <a href="/admin/dashboard/hotels" class="px-4 py-3 border-b border-gray-700 hover:bg-amber-500 hover:text-gray-900 transition-colors">Hotel Registrations</a>
                    <a href="/admin/dashboard" class="px-4 py-3 border-b border-gray-700 hover:bg-indigo-500 hover:text-white transition-colors">Dashboard</a>
                    {#if $page.data.session && $page.url.pathname === '/admin'}
                        <form method="POST" action="?/logout" class="">
                            <button type="submit" class="w-full text-center px-0 py-2 rounded bg-red-600 hover:bg-red-700">
                                Logout <span class="text-xs">({$page.data.session.user.email?.split('@')[0]})</span>
                            </button>
                        </form>
                    {/if}
                </div>
                {/if}
            </nav>
        </header>
        <main class="flex-grow container mx-auto px-6 py-8">
            <slot /> <!-- Admin page content will be rendered here -->
        </main>
        <footer class="bg-gray-800 text-center p-4 text-sm text-gray-500 border-t border-gray-700 rounded">
            Norwegian Open Admin © {new Date().getFullYear()}
        </footer>
    </div>
</div>