import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, ScrollView, StyleSheet, Button, Alert, SafeAreaView, StatusBar } from "react-native";
import { useState, useEffect } from "react";
import SyncStorage from 'sync-storage';

const Stack = createNativeStackNavigator();
const API_URL_POSTS = 'https://jsonplaceholder.typicode.com/posts';

const TelaInicial = ({ navigation }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const obterPosts = async () => {
            try {
                const resposta = await fetch(API_URL_POSTS);
                const dados = await resposta.json();
                setPosts(dados);
            } catch {
                Alert.alert("Erro", "Não foi possível carregar os posts.");
            }
        };
        obterPosts();
    }, []);

    return (
        <SafeAreaView style={estilos.areaSegura}>
            <ScrollView style={estilos.scrollView}>
                <View style={estilos.container}>
                    <Text style={estilos.titulo}>Lista de Posts</Text>
                    <View style={estilos.botaoContainer}>
                        <Button
                            title="Ver Favoritos"
                            color="#4A90E2"
                            onPress={() => navigation.navigate("Favoritos")}
                        />
                    </View>
                    {posts.map(post => (
                        <View key={post.id} style={estilos.card}>
                            <Text style={estilos.tituloPost}>{post.title.replace(/\n/g, " ")}</Text>
                            <Button
                                title="Detalhes"
                                color="#4A90E2"
                                onPress={() => navigation.navigate("VisualizarPosts", { id: post.id, title: post.title, body: post.body })}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const VisualizarPosts = ({ route }) => {
    const [comentarios, setComentarios] = useState([]);
    const { id, title, body } = route.params;

    useEffect(() => {
        const obterComentarios = async () => {
            try {
                const resposta = await fetch(`${API_URL_POSTS}/${id}/comments`);
                const dados = await resposta.json();
                setComentarios(dados);
            } catch {
                Alert.alert("Erro", "Não foi possível carregar os comentários.");
            }
        };
        obterComentarios();
    }, [id]);

    const adicionarFavoritos = async () => {
        try {
            const favoritos = SyncStorage.get('favoritos') || [];
            const postFavorito = { id, title, body };
            if (!favoritos.some(post => post.id === postFavorito.id)) {
                favoritos.push(postFavorito);
                SyncStorage.set('favoritos', favoritos);
                Alert.alert("Sucesso", "Post adicionado aos favoritos!");
            } else {
                Alert.alert("Aviso", "Post já está nos favoritos.");
            }
        } catch {
            Alert.alert("Erro", "Não foi possível favoritar o post.");
        }
    };

    return (
        <SafeAreaView style={estilos.areaSegura}>
            <ScrollView style={estilos.scrollView}>
                <View style={estilos.container}>
                    <Text style={estilos.titulo}>{title.replace(/\n/g, " ")}</Text>
                    <Text style={estilos.textoBody}>{body.replace(/\n/g, " ")}</Text>
                    <Button title="Favoritar" color="#4A90E2" onPress={adicionarFavoritos} />
                    <Text style={estilos.titulo}>Comentários</Text>
                    {comentarios.map(comentario => (
                        <View key={comentario.id} style={estilos.cardComentario}>
                            <Text style={estilos.nomeComentario}>Nome: {comentario.name}</Text>
                            <Text>Email: {comentario.email}</Text>
                            <Text>Comentário: {comentario.body.replace(/\n/g, " ")}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Favoritos = ({ navigation }) => {
    const [postsFavoritos, setPostsFavoritos] = useState([]);

    useEffect(() => {
        const carregarFavoritos = () => {
            try {
                const favoritos = SyncStorage.get('favoritos') || [];
                setPostsFavoritos(favoritos);
            } catch {
                Alert.alert("Erro", "Não foi possível carregar os posts favoritos.");
            }
        };
        carregarFavoritos();
    }, []);

    return (
        <SafeAreaView style={estilos.areaSegura}>
            <ScrollView style={estilos.scrollView}>
                <View style={estilos.container}>
                    <Text style={estilos.titulo}>Posts Favoritos</Text>
                    {postsFavoritos.map(post => (
                        <View key={post.id} style={estilos.card}>
                            <Text style={estilos.tituloFavorito}>{post.title}</Text>
                            <View style={estilos.botaoContainer}>
                                <Button
                                    title="Ver Detalhes"
                                    color="#4A90E2"
                                    onPress={() => navigation.navigate("VisualizarPosts", { id: post.id, title: post.title, body: post.body })}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Tela Inicial" component={TelaInicial} options={{ title: "Tela Inicial" }} />
                <Stack.Screen name="VisualizarPosts" component={VisualizarPosts} options={{ title: "Detalhes do Post" }} />
                <Stack.Screen name="Favoritos" component={Favoritos} options={{ title: "Favoritos" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const estilos = StyleSheet.create({
    areaSegura: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 10,
    },
    card: {
        width: "90%",
        borderWidth: 1,
        borderColor: "#B0BEC5",
        backgroundColor: "#E0F7FA",
        borderRadius: 12,
        marginBottom: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    scrollView: {
        margin: 5,
    },
    tituloPost: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00796B',
        marginBottom: 5,
    },
    botaoContainer: {
        marginVertical: 8,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
        marginVertical: 15,
    },
    textoBody: {
        fontSize: 16,
        color: '#424242',
        paddingVertical: 10,
        textAlign: 'justify',
    },
    cardComentario: {
        width: '100%',
        padding: 10,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: '#E1F5FE',
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    nomeComentario: {
        fontWeight: 'bold',
        color: '#1976D2',
    },
    tituloFavorito: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
});
