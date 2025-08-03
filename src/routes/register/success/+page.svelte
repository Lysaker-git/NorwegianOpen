<!-- src/routes/register/success/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { base } from '$app/paths'; // For constructing asset paths correctly

    let isVisible = false;

    onMount(() => {
        // Slight delay for the fade-in effect
        const timer = setTimeout(() => {
            isVisible = true;
        }, 100);
        return () => clearTimeout(timer);
    });
</script>

<div class="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center px-4 py-12">
    <div
        class={`max-w-md mx-auto p-8 md:p-12 bg-gray-800 rounded-lg shadow-xl border border-green-500/50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
        <div class="mb-6">
            <!-- You can use an SVG checkmark or an image -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-green-400 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h1 class="text-3xl font-bold text-green-300 mb-4">Registration Received!</h1>
        <p class="text-gray-300 mb-6">
            Thank you for registering! Your registration has been received and is currently under review by our team.
        </p>
        <p class="text-gray-400 text-base mb-4">
            Please wait for your registration to be approved before making any travel or hotel arrangements. We want to ensure your spot is confirmed before you book flights or accommodation.
        </p>
        <p class="text-gray-400 text-base mb-8">
            Once your registration is approved, you will receive an email with further details and a link to book your hotel at our special event rates.
        </p>
        <a
            href="{base}/"
            class="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg shadow transition-colors duration-150"
        >
            Back to Homepage
        </a>
    </div>
</div>

<style>
    h1 {
        font-family: 'NorseBold', sans-serif; /* Assuming NorseBold is globally available or imported */
    }
</style>