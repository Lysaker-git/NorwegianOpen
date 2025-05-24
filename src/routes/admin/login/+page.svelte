<!-- src/routes/login/+page.svelte -->
<script lang="ts">
    import type { ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';

    export let form: ActionData;
    let isLoading = false;
    let isVisible = false;

    // Local state for form fields for better UX on error
    let email = form?.values?.email || '';
    let password = ''; // Don't repopulate password

    $: { // Update local state if form.values are passed back on error
        if (form?.values && !form.success) { // only repopulate on error
            email = form.values.email || '';
        }
    }

    onMount(() => {
        setTimeout(() => { isVisible = true; }, 100);
    });
</script>
<div class="my-5">
    <div class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div class={`max-w-md w-full space-y-8 p-8 md:p-10 bg-gray-800 shadow-xl rounded-xl border border-gray-700 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div>
                <h1 class="mt-6 text-center text-4xl font-bold text-amber-400 font-[NorseBold]">
                    Admin Login
                </h1>
            </div>
    
            {#if form?.error}
                <div class="rounded-md bg-red-700/50 p-4 mt-4">
                    <p class="text-sm font-medium text-red-200">{form.error}</p>
                </div>
            {/if}
            {#if form?.success}
                 <div class="rounded-md bg-green-700/50 p-4 mt-4">
                    <p class="text-sm font-medium text-green-200">Login successful! Redirecting...</p>
                </div>
            {/if}
    
            <form
            class="mt-8 space-y-6"
            method="POST"
            action="?/login"
            use:enhance={() => {
                isLoading = true;
                return async ({ result, update }) => {
                    console.log('[ENHANCE] Server responded. Result:', JSON.stringify(result, null, 2));
                    
                    if (result.type === 'redirect') {
                        console.log(`[ENHANCE] Redirect detected to "${result.location}". Using window.location.`);
                        // Force full page navigation to ensure hook processes the session properly
                        window.location.href = result.location;
                        return; // Don't reset isLoading since we're navigating away
                    }
                    
                    // Handle non-redirect responses (errors, etc.)
                    await update();
                    isLoading = false;
                };
            }}
        >
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email-address" class="sr-only">Email address</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                            placeholder="Email address"
                            bind:value={email}
                        />
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                            placeholder="Password"
                            bind:value={password}
                        />
                    </div>
                </div>
    
                <div>
                    <button
                        type="submit"
                        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-500 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {#if isLoading}
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        {:else}
                            Sign in
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>