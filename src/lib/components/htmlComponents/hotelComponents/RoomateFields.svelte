<script lang="ts">
    export let twinRoomMate: string = '';
    export let tripleRoomMate1: string = '';
    export let tripleRoomMate2: string = '';
    export let quatroRoomMate1: string = '';
    export let quatroRoomMate2: string = '';
    export let quatroRoomMate3: string = '';

    
</script>


<div class="mt-2">
    <label for="twinRoomMate" class="block text-sm font-medium">Name of your roommate *</label>
    <input required type="text" id="twinRoomMate" name="Roommate1"
        bind:value={twinRoomMate}
        placeholder="Roommate name"
        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
</div>

<fieldset class="mt-2 p-2 border border-gray-600 rounded-md space-y-2">
    <legend class="text-md font-medium text-white px-1">Names of your roommates *</legend>
    <input required type="text" id="tripleRoomMate1" name="Roommate1"
        bind:value={tripleRoomMate1}
        placeholder="Roommate 1 name"
        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
    <input required type="text" id="tripleRoomMate2" name="Roommate2"
        bind:value={tripleRoomMate2}
        placeholder="Roommate 2 name"
        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
</fieldset>

<fieldset class="mt-2 p-2 border border-gray-600 rounded-md space-y-2">
    <legend class="text-md font-medium text-white px-1">Names of your roommates *</legend>
    <input required type="text" id="tripleRoomMate1" name="Roommate1"
        bind:value={quatroRoomMate1}
        placeholder="Roommate 1 name"
        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
    <input required type="text" id="tripleRoomMate2" name="Roommate2"
        bind:value={quatroRoomMate2}
        placeholder="Roommate 2 name"
        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
    <input required type="text" id="tripleRoomMate2" name="Roommate2"
        bind:value={quatroRoomMate3}
        placeholder="Roommate 3 name"
        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
</fieldset>