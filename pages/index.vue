<template>
    <div class="flex flex-col h-screen text-sm text-white bg-gray-900">
        <Header />
        <Main />
        <Tooltip />
        <Toast />
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
