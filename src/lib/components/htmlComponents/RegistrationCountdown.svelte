<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { calculateTimeRemaining } from '$lib/components/utils';
    import { REG_OPEN_STRING } from '$lib/components/constants';
    
    const regOpenDate = new Date(REG_OPEN_STRING + 'T19:00:00');
    let timeRemaining = calculateTimeRemaining(regOpenDate);
    let countdownInterval: ReturnType<typeof setInterval>;

    onMount(() => {
        // Update every second
        countdownInterval = setInterval(() => {
            timeRemaining = calculateTimeRemaining(regOpenDate);
        }, 1000);
    });
    
    onDestroy(() => {
        // Clean up interval when component is destroyed
        if (countdownInterval) clearInterval(countdownInterval);
    });
</script>

<div class="countdown text-white text-xxl">
    <p>Registration opens in:</p>
    <div class="countdown-timer">
        <div class="time-section">
            <span class="time">{timeRemaining.days}</span>
            <span class="label">days</span>
        </div>
        <div class="time-section">
            <span class="time">{timeRemaining.hours}</span>
            <span class="label">hours</span>
        </div>
        <div class="time-section">
            <span class="time">{timeRemaining.minutes}</span>
            <span class="label">minutes</span>
        </div>
        <div class="time-section">
            <span class="time">{timeRemaining.seconds}</span>
            <span class="label">seconds</span>
        </div>
    </div>
</div>

<style>
    .countdown {
        margin-top: 1rem;
        text-align: center;
    }
    
    .countdown-timer {
        display: flex;
        justify-content: center;
        gap: clamp(1rem, 2vw + 0.5rem, 4rem);
        margin-top: 0.5rem;
    }
    
    .time-section {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .time {
        font-size: clamp(1rem, 6vw + 1rem, 5rem);
        font-weight: bold;
        font-family: 'Norse';
    }
    
    .label {
        font-size: 0.8rem;
        text-transform: uppercase;
        font-family: 'Norse';
    }
</style>