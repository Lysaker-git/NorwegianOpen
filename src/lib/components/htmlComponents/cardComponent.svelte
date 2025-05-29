<script lang="ts">
    export let option: {
        cardLabel: string;
        description: string;
        price: number;
        image: string;
    };

    function formatPrice(price: number | undefined) {
        return price ? `${price.toLocaleString()} NOK` : '';
    }
</script>

<div
    class="absolute inset-0 rounded-lg overflow-hidden z-0"
    style="pointer-events: none;"
>
    <div
        class="w-full h-full"
        style={`background-image: url('${option.image}'); background-size: cover; background-position: center; filter: brightness(0.15) blur(2px); position: absolute; inset: 0;`}
    ></div>
</div>
<div class="relative z-10">
    <div class="text-lg font-bold text-amber-400 mb-2">{option.cardLabel}</div>
    <div class="text-gray-200 mb-2">{option.description}</div>
    <div class="text-amber-300 font-semibold">{formatPrice(option.price)}</div>
</div>