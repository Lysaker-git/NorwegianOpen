<script lang="ts">
    import type { ActionData } from './$types';
    import { REG_OPEN_STRING } from '$lib/components/constants';
    import RegistrationCountdown from '$lib/components/htmlComponents/RegistrationCountdown.svelte';
    import RegistrationForm from '$lib/components/htmlComponents/RegistrationForm.svelte';

    export let form: ActionData;
    
    const regOpenDate = new Date(REG_OPEN_STRING + 'T17:00:00');
    const today = new Date();
</script>

<div class="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
    <!-- Success/Error Messages -->
    {#if form?.success}
        <div class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            Registration successful! Please check your email for confirmation.
        </div>
    {/if}
    {#if form?.error && !form?.field}
        <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {form.error}
        </div>
    {/if}

    {#if today <= regOpenDate}
        <h1 class="text-4xl text-center">Registration not open yet</h1>
        <RegistrationCountdown />
    {:else}
        <h1 class="text-2xl font-bold mb-6 text-center">Registration Form</h1>
        <RegistrationForm {form} />
    {/if}
</div>

<style global>
    h1 {
        font-family: 'NorseBold';
    }
</style>