<template>
    <div class="flex flex-col h-screen text-white text-sm bg-gray-900">
        <Header />
        <Main />
        <Tooltip />
        <Keyboard />
    </div>
</template>

<style lang="scss">
html,
body {
    height: 100vh;
    overflow: hidden;
}

body {
    font-family: 'Inter', sans-serif;
}
</style>
