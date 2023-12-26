<script lang="ts">
    import AuthCheck from "$lib/components/AuthCheck.svelte";
    import { databank, user, userData } from "$lib/firebase";
    import { doc, getDoc, writeBatch } from "firebase/firestore";


    let username = "";
    let loading = false;
    let isAvailable = false;

    let debounceTimer: NodeJS.Timeout;

    const re = /^(?=[a-zA-Z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    $: isValid = username?.length > 2 && username.length < 16 && re.test(username);
    $: isTouched = username?.length > 0;
    $: isTaken = isValid && !isAvailable && !loading;

    async function checkAvailability() {
        loading = true;
        isAvailable = false;
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            console.log("Checking availability");
            const ref = doc(databank, "users", username);
            const exists = await getDoc(ref).then((doc) => doc.exists());
            isAvailable = !exists;
            loading = false;
        }, 500);
    }

    async function confirmUsername() {
        console.log("confirming username...");
        const batch = writeBatch(databank);
        batch.set(doc(databank, "usernames", username), {uid: $user?.uid});
        batch.set(doc(databank, "users", $user!.uid), {
            username,
            photoURL: $user?.photoURL ?? null,
            published: true,
            bio: 'I am the eggman',
            links: [
                {
                    title: 'test',
                    url: 'http://google.com',
                    icon: 'custom'
                }
            ]
        });

        await batch.commit();

        username = '';
        isAvailable = false;
    }


</script>

<AuthCheck>
    {#if $userData?.username}
        <p class="text-center text-2xl">You already have a username: <a href="/@{$userData.username}">@{$userData.username}</a></p>
    {/if}
    <form class="w-2/5" on:submit|preventDefault={confirmUsername}>
        <input
            type="text"
            placeholder="username"
            class="input w-full"
            bind:value={username}
            on:input={checkAvailability}
            class:input-error={(!isValid && isTouched)}
            class:input-warning={(isTaken)}
            class:input-success={(isAvailable && isValid && !loading)}
        />
        <div class="my-4 min-h16 px-8 w-full">
            {#if loading}
                <p class="text-secondary">Checking availability of @{username}...</p>
            {/if}
            {#if !isValid && isTouched}
                <p class="text-error text-sm">must be 3-16 characters long, alphanumeric only</p>
            {/if}
            {#if isValid && !isAvailable && !loading}
                <p class="text-warning text-sm">@{username} is already taken</p>
            {/if}
            {#if isValid && isAvailable && !loading}
                <button class="btn btn-success">Confirm username @{username}</button>
            {/if}
        </div>
</AuthCheck>