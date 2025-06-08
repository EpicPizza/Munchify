<script lang="ts">
    let topic = '';
    let loading = false;
    let error: string | null = null;
    let videoUri: string | null = null;

    async function handleSubmit() {
        loading = true;
        error = null;
        videoUri = null;

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate video');
            }

            videoUri = data.videoUri;
        } catch (e) {
            error = e instanceof Error ? e.message : 'An error occurred';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold mb-6 text-center">Generate Video</h1>
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div>
                <label for="topic" class="block text-sm font-medium text-gray-700 mb-1">
                    Enter a Topic
                </label>
                <input
                    type="text"
                    id="topic"
                    bind:value={topic}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Battle of Stalingrad, Gandhi, Newton's Laws"
                    disabled={loading}
                />
            </div>

            <button
                type="submit"
                class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={loading || !topic}
            >
                {loading ? 'Generating...' : 'Generate Video'}
            </button>
        </form>

        {#if error}
            <div class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
            </div>
        {/if}

        {#if videoUri}
            <div class="mt-6">
                <h2 class="text-lg font-semibold mb-2">Generated Video</h2>
                <div class="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                        title="Generated Video"
                        src={videoUri}
                        width="100%"
                        height="100%"
                        frameborder="0"
                        allow="autoplay; fullscreen"
                        allowfullscreen
                    ></iframe>
                </div>
            </div>
        {/if}
    </div>
</div> 