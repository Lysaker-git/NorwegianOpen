<script lang="ts">
    import bannerImage from '$lib/components/images/imagesPros/banner.jpg';
    import { pros } from '$lib/components/objects/pros';
    import { proImages } from '$lib/components/constants';

</script>

<h1>Our Pros and Staff</h1>
{#each pros as pro, i}
    <section class="pro-section">
        <div class="pro-img">
            <img src={proImages[pro.name] || bannerImage} alt={pro.name} />
        </div>
        <div class="pro-info">
            <h2>{pro.name}</h2>
            <div class="bio-text">
                {#each pro.paragraphs as para}
                    <p>{para}</p>
                {/each}
            </div>
        </div>
    </section>
{/each}

<style>
h1 {
    text-align: center;
    font-size: 4rem;
    margin: 2.5rem 0 3rem 0;
    font-family: 'NorseBold', serif;
    color: #ffe08a;
}

.pro-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    margin: 0 auto;
    max-width: clamp(600px, 90%, 1200px);
    gap: 2rem;
    height: 50rem;
    align-items: center;
}

.pro-img {
    width: 400px;
    aspect-ratio: 4/5;
    min-width: 240px;
    max-width: 600px;
    border-radius: 1rem;
    overflow: hidden;
    display: grid;
    place-items: center;
    height: 100%;
}
.pro-img img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 1rem;
    display: block;
    justify-self: center;
    align-self: center;
}

.pro-info {
    color: white;
    font-family: 'NorseBold', serif;
    display: grid;
    gap: 1rem;
    align-items: center;
    justify-items: center;
    text-align: center;
}

.pro-info h2 {
    font-size: clamp(2.5rem, calc(2.5rem + 1vw), 5.5rem);
    margin-bottom: 1rem;
}

.bio-text p:not(:first-child) {
    margin-top: 1rem;
}

.bio-text p {
    text-align: start;
}

@media (max-width: 900px) {
    .pro-section {
        grid-template-columns: 1fr;
        height: auto;
        gap: 1.5rem;
        padding: 1.5rem 0;
    }
    .pro-img {
        width: 90vw;
        max-width: 98vw;
        min-width: 120px;
        aspect-ratio: 4/5;
        height: 700px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .pro-img img {
        object-fit: cover;
        object-position: center;
    }
    .pro-info {
        padding: 0 1vw;
    }
    h1 {
        font-size: clamp(1.7rem, calc(1.7rem + 1vw), 2.5rem);
        margin: 1.5rem 0 2rem 0;
    }
    .pro-info h2 {
        font-size: clamp(1.3rem, calc(1.3rem + 1vw), 2rem);
    }
    .bio-text p {
        font-size: clamp(1rem, calc(1rem + 0.5vw), 1.2rem);
    }
}
@media (max-width: 600px) {
    .pro-section {
        padding: 0.5rem 0;
        gap: 1rem;
    }
    .pro-img {
        width: 98vw;
        height: 500px;
        min-width: 80px;
        aspect-ratio: 4/5;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .pro-img img {
        object-fit: cover;
        object-position: center;
    }
    .pro-info {
        padding: 0 2vw;
    }
    h1 {
        font-size: 2.5rem;
        margin: 1rem 0 1.5rem 0;
    }
    .pro-info h2 {
        font-size: 2rem;
    }
    .bio-text p {
        font-size: 0.92rem;
    }
}
</style>