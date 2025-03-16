<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/user';

const emits = defineEmits<{
    (e: 'redirect'): void
}>();

const user = useUserStore();

const name = ref<string>();
const email = ref<string>();
const password = ref<string>();

const authorizationType = ref<'login' | 'register'>('login');

function submitUser() {
    
    if (authorizationType.value === 'login') {
        user.fetch(email.value, password.value)
    }
    else {
        console.log(name, email, password)
        console.log("test");
    }

    email.value = "";
    password.value = "";
    name.value = "";

    emits('redirect');
}

</script>

<template>
    <div class="w-full h-screen flex items-center justify-center jetbrains-mono-code bg-[#141414] text-lg text-white">
        <form v-if="authorizationType === 'login'" @submit.prevent="submitUser" class="w-1/3 h-1/3  p-3 flex justify-center items-center">
            <div class="w-fit flex flex-col gap-y-16">
                <div>
                    <p>Email</p>
                    <input class="bg-black text-white mt-2 rounded-2xl p-2" v-model="email" />
                </div>
                <div>
                    <p>Password</p>
                    <input class="bg-black text-white mt-2 rounded-2xl p-2" v-model="password" />
                </div>
                <div class="flex flex-row gap-x-4 items-center self-end">
                    <div class="opacity-50 cursor-pointer hover:opacity-100 transition-all ease-linear duration-100" @click="authorizationType = 'register'">Register</div>
                    <button type="submit" class="rounded-2xl p-2 bg-[#F4511E] cursor-pointer hover:bg-[#f37852] transition-all ease-linear duration-100">Login</button>
                </div>
            </div>
        </form>

        <form v-else class="w-1/3 h-1/3  p-3 flex justify-center items-center">
            <div class="w-fit flex flex-col gap-y-10">
                <div>
                    <p>Name</p>
                    <input class="bg-black text-white mt-2 rounded-2xl p-2" v-model="name" />
                </div>
                <div>
                    <p>Email</p>
                    <input class="bg-black text-white mt-2 rounded-2xl p-2" v-model="email" />
                </div>
                <div>
                    <p>Password</p>
                    <input class="bg-black text-white mt-2 rounded-2xl p-2" v-model="password" />
                </div>
                <div class="flex flex-row gap-x-4 items-center self-end">
                    <div class="opacity-50 cursor-pointer hover:opacity-100 transition-all ease-linear duration-100">Alredy have</div>
                    <button class="rounded-2xl p-2 bg-[#F4511E] cursor-pointer hover:bg-[#f37852] transition-all ease-linear duration-100">Register</button>
                </div>
            </div>
        </form>
    </div>
</template>