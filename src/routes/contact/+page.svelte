<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
    import type { ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';

    export let form: ActionData;

    let isVisible = false;
    let isLoading = false;

    // --- FIX: Declare local variables for form fields ---
    let name = '';
    let email = '';
    let subject = '';
    let message = '';

    // --- FIX: Initialize local variables from form data if it exists ---
    // This handles repopulating the form on error
    $: {
        if (form?.values) {
            name = form.values.name || '';
            email = form.values.email || '';
            subject = form.values.subject || '';
            message = form.values.message || '';
        } else if (form?.success) {
            // Optionally clear fields on success if not resetting the whole form via enhance
            name = '';
            email = '';
            subject = '';
            message = '';
        }
    }

    onMount(() => {
        setTimeout(() => {
            isVisible = true;
        }, 100);
    });
</script>

<div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class={`max-w-md w-full space-y-8 p-8 md:p-10 bg-gray-800 shadow-xl rounded-xl border border-gray-700 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div>
            <h1 class="text-center text-4xl font-bold text-amber-400 font-[NorseBold]">
                Contact Us
            </h1>
            <p class="mt-2 text-center text-sm text-gray-400">
                Have a question or feedback? Let us know!
            </p>
        </div>

        {#if form?.success}
            <div class="rounded-md bg-green-700/50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-green-200">
                            Message sent successfully! We'll get back to you soon.
                        </p>
                    </div>
                </div>
            </div>
        {/if}

        {#if form?.error}
            <div class="rounded-md bg-red-700/50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-red-200">
                            {form.error}
                        </p>
                    </div>
                </div>
            </div>
        {/if}

        <form
            class="mt-8 space-y-6"
            method="POST"
            action="?/sendMessage"
            use:enhance={() => {
                isLoading = true;
                return async ({ result, update }) => {
                    // The reactive block `$: { ... }` will handle updating local vars
                    // if `form.values` comes back from the server.
                    // It will also clear them if `form.success` is true.
                    await update(); // This updates the `form` prop
                    isLoading = false;
                    // No need to manually reset here if the reactive block handles clearing on success
                    // if (result.type === 'success' && result.status === 200) {
                    //     // const formEl = document.querySelector('form');
                    //     // if (formEl) formEl.reset();
                    // }
                };
            }}
        >
            <input type="hidden" name="remember" value="true" />
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="name" class="sr-only">Full Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        autocomplete="name"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                        placeholder="Full Name"
                        bind:value={name}
                    />
                </div>
                <div>
                    <label for="email-address" class="sr-only">Email address</label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                        bind:value={email}
                    />
                </div>
                <div>
                    <label for="subject" class="sr-only">Subject</label>
                    <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                        placeholder="Subject"
                        bind:value={subject}
                    />
                </div>
                <div>
                    <label for="message" class="sr-only">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                        placeholder="Your message..."
                        bind:value={message}
                    ></textarea>
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
                        Sending...
                    {:else}
                        Send Message
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    h1 {
        font-family: 'NorseBold', sans-serif;
    }
</style>