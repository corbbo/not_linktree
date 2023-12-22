<script lang="ts">
    import { auth } from "$lib/firebase";
    import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
    import { user } from "$lib/firebase";

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log(result);
    }
</script>

<h2>Sign In</h2>

{#if $user}
    <h2 class="card-title">Welcome, {$user.displayName}</h2>
    <p class="text-center text-success">You are signed in!</p>
    <button class="btn btn-primary" on:click={() => signOut(auth)}>Sign Out</button>
{:else}
    <button class="btn btn-primary" on:click={signInWithGoogle}>Sign in with Google</button>
{/if}