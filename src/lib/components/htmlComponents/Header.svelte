<!-- src/lib/components/Header.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import DarkLogo from '$lib/components/logo/nopenDarkLogo.png';
    
    let isMenuOpen = false;
    let isTransitioning = false;
    let aboutDropdownOpen = false;
    let registerDropdownOpen = false;

    // Handle menu toggle with transition lock to prevent multiple clicks during animation
    function toggleMenu() {
        if (!isTransitioning) {
            isTransitioning = true;
            isMenuOpen = !isMenuOpen;
            setTimeout(() => {
                isTransitioning = false;
            }, 300);
        }
    }

    function handleNavClick() {
        if (isMenuOpen) toggleMenu();
        aboutDropdownOpen = false;
        registerDropdownOpen = false;
    }

    function toggleAboutDropdown() {
        aboutDropdownOpen = !aboutDropdownOpen;
        registerDropdownOpen = false;
    }
    function toggleRegisterDropdown() {
        registerDropdownOpen = !registerDropdownOpen;
        aboutDropdownOpen = false;
    }
    function closeDropdowns() {
        aboutDropdownOpen = false;
        registerDropdownOpen = false;
    }

    // Close mobile menu on resize to desktop
    onMount(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        function handleResize(e) {
            if (e.matches && isMenuOpen) {
                isMenuOpen = false;
            }
        }
        mediaQuery.addEventListener('change', handleResize);
        document.addEventListener('click', handleOutsideClick);
        return () => {
            mediaQuery.removeEventListener('change', handleResize);
            document.removeEventListener('click', handleOutsideClick);
        };
    });

    // Handle escape key to close menu
    function handleKeydown(e) {
        if (e.key === 'Escape' && isMenuOpen) toggleMenu();
        if (e.key === 'Escape') closeDropdowns();
    }

    // Close dropdowns when clicking outside
    function handleOutsideClick(e) {
        const about = document.getElementById('about-dropdown');
        const aboutBtn = document.getElementById('about-btn');
        const reg = document.getElementById('register-dropdown');
        const regBtn = document.getElementById('register-btn');
        if (
            aboutDropdownOpen && about && aboutBtn &&
            !about.contains(e.target) && !aboutBtn.contains(e.target)
        ) {
            aboutDropdownOpen = false;
        }
        if (
            registerDropdownOpen && reg && regBtn &&
            !reg.contains(e.target) && !regBtn.contains(e.target)
        ) {
            registerDropdownOpen = false;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<header class="flex items-center justify-between px-8 py-6 relative z-50 text-white">
    <div class="logo relative z-10">
        <a href="/" on:click={handleNavClick}>
            <img class="cInvert h-12" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
        </a>
    </div>
    <!-- Desktop Navigation -->
    <nav class="hidden md:block">
        <ul class="flex space-x-6 items-center">
            <li>
                <a href="/" class="hover:text-amber-200 transition-colors duration-300 font-bold">Home</a>
            </li>
            <li class="relative">
                <button id="about-btn" on:click|stopPropagation={toggleAboutDropdown} class="hover:text-amber-200 transition-colors duration-300 font-bold flex items-center">
                    About Event
                    <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
                </button>
                {#if aboutDropdownOpen}
                <div id="about-dropdown" class="absolute left-0 mt-2 w-48 bg-[#4F4943] rounded shadow-lg z-50" transition:fade={{ duration: 200 }}>
                    <ul class="flex flex-col py-2">
                        <li><a href="/about" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">About</a></li>
                        <li><a href="/schedule" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Schedule</a></li>
                        <li><a href="/coc" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Code of Conduct</a></li>
                        <!-- <li><a href="/toc" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Terms & Conditions</a></li> -->
                        <!-- <li><a href="/staff" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Staff</a></li> -->
                        <li><a href="/teachers" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Teachers</a></li>
                        <li><a href="/location" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Location</a></li>
                    </ul>
                </div>
                {/if}
            </li>
            <li class="relative">
                <button id="register-btn" on:click|stopPropagation={toggleRegisterDropdown} class="hover:text-amber-200 transition-colors duration-300 font-bold flex items-center">
                    Register
                    <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
                </button>
                {#if registerDropdownOpen}
                <div id="register-dropdown" class="absolute left-0 mt-2 w-48 bg-[#4F4943] rounded shadow-lg z-50" transition:fade={{ duration: 200 }}>
                    <ul class="flex flex-col py-2">
                        <li><a href="/pricing" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Pricing</a></li>
                        <li><a href="/rules" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Rules</a></li>
                        <li><a href="/register" on:click={handleNavClick} class="px-4 py-2 hover:text-amber-200 transition-colors duration-300">Register</a></li>
                    </ul>
                </div>
                {/if}
            </li>
            <li>
                <a href="/contact" class="hover:text-amber-200 transition-colors duration-300 font-bold">Contact Us</a>
            </li>
        </ul>
    </nav>
    <!-- Mobile Menu Button -->
    <div class="md:hidden relative z-10">
        <button 
            on:click={toggleMenu} 
            class="text-white focus:outline-none p-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
        >
            <svg class="h-6 w-6 fill-current transition-opacity duration-300 {isMenuOpen ? 'opacity-0 absolute' : 'opacity-100'}" viewBox="0 0 24 24">
                <path
                    fill-rule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
            </svg>
            <svg class="h-6 w-6 fill-current transition-opacity duration-300 {isMenuOpen ? 'opacity-100' : 'opacity-0 absolute'}" viewBox="0 0 24 24">
                <path
                    fill-rule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
            </svg>
        </button>
    </div>
</header>

<!-- Full-screen Mobile Navigation Menu -->
{#if isMenuOpen}
<div class="fixed inset-0 bg-[#4F4943] z-40 flex md:hidden" transition:fade={{ duration: 200 }}>
    <nav class="h-full w-full flex flex-col justify-center items-center">
        <ul class="flex flex-col items-center justify-between h-3/4 text-white w-full">
            <li class="mb-4">
                <a href="/" on:click={handleNavClick} class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300">Home</a>
            </li>
            <li class="w-full">
                <button on:click={() => aboutDropdownOpen = !aboutDropdownOpen} class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300 w-full flex justify-center items-center">
                    About Event
                    <svg class="ml-2 h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
                </button>
                {#if aboutDropdownOpen}
                <ul class="flex flex-col items-center mt-2" transition:fade={{ duration: 200 }}>
                    <li><a href="/about" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">About</a></li>
                    <li><a href="/schedule" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Schedule</a></li>
                    <li><a href="/coc" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Code of Conduct</a></li>
                    <!-- <li><a href="/toc" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Terms & Conditions</a></li> -->
                    <!-- <li><a href="/staff" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Staff</a></li> -->
                    <li><a href="/teachers" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Teachers</a></li>
                    <li><a href="/location" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Location</a></li>
                </ul>
                {/if}
            </li>
            <li class="w-full mt-4">
                <button on:click={() => registerDropdownOpen = !registerDropdownOpen} class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300 w-full flex justify-center items-center">
                    Register
                    <svg class="ml-2 h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
                </button>
                {#if registerDropdownOpen}
                <ul class="flex flex-col items-center mt-2" transition:fade={{ duration: 200 }}>
                    <li><a href="/pricing" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Pricing</a></li>
                    <li><a href="/rules" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Rules</a></li>
                    <li><a href="/register" on:click={handleNavClick} class="text-xl py-2 hover:text-amber-200 transition-colors duration-300">Register</a></li>
                </ul>
                {/if}
            </li>
            <li class="mt-4">
                <a href="/contact" on:click={handleNavClick} class="text-3xl font-bold hover:text-amber-200 transition-colors duration-300">Contact Us</a>
            </li>
        </ul>
    </nav>
</div>
{/if}

<style>
    .cInvert {
        filter: invert(100%);
    }
</style>