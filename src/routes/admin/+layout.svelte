<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
</script>

<div class="mx-8 ">
    <div class="admin-layout min-h-screen flex flex-col bg-gray-900 text-gray-100 rounded shadow--lg">
        <header class="bg-gray-800 shadow-md rounded">
            <nav class="container mx-auto px-6 py-3 flex justify-between items-center">
                <a href="/admin" class="text-xl font-bold text-amber-400 hover:text-amber-300">Admin Panel</a>
                <div>
                <a href="/admin/registrations" class="px-4 py-2 rounded bg-amber-500 text-gray-900 font-semibold shadow hover:bg-amber-400 transition-colors duration-150 mr-2">
                    Registrations
                </a>
                <a href="/admin/dashboard/hotels" class="px-4 py-2 rounded bg-amber-500 text-gray-900 font-semibold shadow hover:bg-amber-400 transition-colors duration-150 mr-2">
                    Hotel Registrations
                </a>
                <a href="/admin/dashboard" class="px-4 py-2 rounded bg-indigo-500 text-white font-semibold shadow hover:bg-indigo-400 transition-colors duration-150">
                    Dashboard
                </a>                    
                <!-- Add more admin links here -->
                    {#if $page.data.session && $page.url.pathname === '/admin'}
                        <form 
                            method="POST" 
                            action="?/logout" 
                            class="inline"
                        >
                        <button type="submit" class="ml-4 px-3 py-2 rounded bg-red-600 hover:bg-red-700">
                            Logout <span class="text-xs">({$page.data.session.user.email?.split('@')[0]})</span>
                        </button>
                    </form>
                    {/if}
                </div>
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