<!-- src/routes/+page.svelte (Or relevant route) -->
<script lang="ts">
	import type { ActionData } from './$types'; // Import ActionData type
    import { enhance } from '$app/forms'; // Optional: for progressive enhancement

	export let form: ActionData; // This prop receives data back from the server action

    // If you loaded data (like countries) in load():
    // export let data;
    // const countries = data.countries || [];

</script>

<div class="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
    <h1 class="text-2xl font-bold mb-6 text-center">Registration Form</h1>

    <!-- Optional: Show success message -->
    {#if form?.success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong class="font-bold">Success!</strong>
            <span class="block sm:inline"> Registration submitted successfully.</span>
            <!-- Optionally display inserted ID: {form.insertedId} -->
        </div>
    {/if}

    <!-- Optional: Show general form error -->
    {#if form?.error && !form?.field}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {form.error}</span>
        </div>
    {/if}

    <!-- The actual form -->
    <!-- Add `use:enhance` for progressive enhancement (no full page reload) -->
    <form method="POST" action="?/register" class="space-y-4">

        <!-- Helper function to display field-specific errors -->
        {#if form?.field === 'Email'}
            <p class="text-red-600 text-sm mt-1">{form.error}</p>
        {/if}
        <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" id="email" name="Email" required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   aria-invalid={form?.field === 'Email'}
                   />
        </div>

        {#if form?.field === 'FullName'}
            <p class="text-red-600 text-sm mt-1">{form.error}</p>
        {/if}
        <div>
            <label for="fullname" class="block text-sm font-medium text-gray-700">Full Name *</label>
            <input type="text" id="fullname" name="FullName" required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   aria-invalid={form?.field === 'FullName'}
                   />
        </div>

        <div>
            <label for="wsdcid" class="block text-sm font-medium text-gray-700">WSDC ID (Optional)</label>
            <input type="text" id="wsdcid" name="WSDCID"
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>

        <div>
            <label for="passtype" class="block text-sm font-medium text-gray-700">Pass Type</label>
            <select id="passtype" name="Passtype"
                    class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select Pass Type</option>
                <option value="Full Pass">Full Pass</option>
                <option value="Party Pass">Party Pass</option>
                <!-- Add other pass types -->
            </select>
        </div>

        <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Preferred Role</label>
            <select id="role" name="Role"
                    class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select Role</option>
                <option value="Leader">Leader</option>
                <option value="Follower">Follower</option>
                <option value="Switch">Switch</option>
            </select>
        </div>

         <!-- Add inputs for PartnerName, Gender, Country, PartnerID similarly -->
         <div>
            <label for="partnerName" class="block text-sm font-medium text-gray-700">Partner Name (If applicable)</label>
            <input type="text" id="partnerName" name="PartnerName"
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
        <!-- ... other fields ... -->

         <div>
            <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
            <input type="text" id="country" name="Country"
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            <!-- Or use a select dropdown if you loaded countries -->
        </div>

        <div class="flex items-center">
            <input id="competing" name="Competing" type="checkbox"
                   class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="competing" class="ml-2 block text-sm text-gray-900"> Are you planning to compete? </label>
        </div>

        <!-- Add inputs for PaymentType, HotelRoomType, AmountDue, PaymentDeadline -->
         <div>
            <label for="amountDue" class="block text-sm font-medium text-gray-700">Amount Due</label>
            <input type="number" step="0.01" id="amountDue" name="AmountDue"
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
         <div>
            <label for="paymentDeadline" class="block text-sm font-medium text-gray-700">Payment Deadline</label>
            <input type="date" id="paymentDeadline" name="PaymentDeadline"
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>


        <!-- Acceptance Checkboxes -->
        {#if form?.field === 'Terms'}
             <p class="text-red-600 text-sm mt-1">{form.error}</p>
        {/if}
        <div class="space-y-2">
             <div class="flex items-center">
                 <input id="acceptedRules" name="AcceptedRules" type="checkbox" required
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        aria-invalid={form?.field === 'Terms'}
                        >
                 <label for="acceptedRules" class="ml-2 block text-sm text-gray-900"> I have read and accept the Competition Rules *</label>
                 <!-- Link to rules page if available -->
             </div>
             <div class="flex items-center">
                 <input id="acceptedToC" name="AcceptedToC" type="checkbox" required
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        aria-invalid={form?.field === 'Terms'}
                        >
                 <label for="acceptedToC" class="ml-2 block text-sm text-gray-900"> I have read and accept the Terms & Conditions / Code of Conduct *</label>
                 <!-- Link to ToC/CoC page if available -->
             </div>
        </div>


        <div>
            <button type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Register
            </button>
        </div>
    </form>
</div>