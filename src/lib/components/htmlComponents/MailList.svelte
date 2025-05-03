<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from '../../../routes/register/$types';

    export let form: ActionData;
</script>

<form action="?/mailList" method="POST" use:enhance>
    <div>
        <label for="email" class="text-left block text-sm font-medium text-gray-700">Email *</label>
        <input type="email" id="email" name="Email" required
               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
               aria-invalid={form?.field === 'Email'} />
        {#if form?.field === 'Email'} 
            <p class="text-red-600 text-sm mt-1">{form.error}</p> 
        {/if}
    </div>
    <button
    type="submit"
    class="my-4 px-6 py-3 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 ease-in-out"
  >
    Subscribe for updates
  </button>
</form>

<style>

</style>