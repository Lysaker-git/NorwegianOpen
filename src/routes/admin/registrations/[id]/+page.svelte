<script lang="ts">
    export let data;
    console.log('Registration data:', data);
</script>

{#if data.registration}
    <h1>Registration Details</h1>
    <p><strong>Name:</strong> {data.registration.FullName}</p>
    <p><strong>Email:</strong> {data.registration.Email}</p>
    <!-- Add more fields as needed -->
    <a href="/admin/registrations">Back to list</a>
{:else}
    <p>Registration not found.</p>
{/if}