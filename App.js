import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import SyncStorage from 'sync-storage';

const Stack = createNativeStackNavigator();
const URL_API = `https://jsonplaceholder.typicode.com/posts`;
const URL_COMENTARIOS = `https://jsonplaceholder.typicode.com/posts/`;

function TelaInicial({ navigation }) {
    const [dados, setDados] = useState([]);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const resposta = await fetch(URL_API);
                const resultado = await resposta.json();
                setDados(resultado);
            } catch {
                Alert.alert('Falha ao carregar os posts');
            }
        };
        carregarDados();
    }, []);

    return (
        <ScrollView style={styles.containerScroll}>
            <View style={styles.containerPrincipal}>
                <Text style={styles.titulo}>Tela Inicial</Text>

                <TouchableOpacity
                    style={styles.botao}
                    onPress={() => navigation.navigate("Favoritos")}
                >
                    <Text style={styles.textoBotao}>Favoritos</Text>
                </TouchableOpacity>

                {dados.map(item => (
                    <View key={item.id} style={styles.cartao}>
                        <View style={styles.conteudoCartao}>
                            <Text style={styles.tituloCartao}>Título: {item.title}</Text>
                        </View>
                        <Button
                            title='VER'
                            color="blue"
                            onPress={() => navigation.navigate("DetalhesPost", { id: item.id })}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

function TelaFavoritos({ navigation }) {
    const [favoritos, setFavoritos] = useState([]);

    useEffect(() => {
        const carregarFavoritos = async () => {
            try {
                const listaFav = SyncStorage.get('favorites') ? JSON.parse(SyncStorage.get('favorites')) : [];
                setFavoritos(listaFav);
            } catch (error) {
                console.error('Erro ao recuperar favoritos:', error);
            }
        };
        carregarFavoritos();
    }, []);

    return (
        <ScrollView style={styles.containerScroll}>
            <View style={styles.containerPrincipal}>
                <Text style={styles.titulo}>Favoritos</Text>
                <View style={styles.containerFavoritos}>
                    {favoritos.length > 0 ? (
                        favoritos.map((fav) => (
                            <TouchableOpacity
                                key={fav.id}
                                onPress={() => navigation.navigate("DetalhesPost", { id: fav.id })}
                            >
                                <View style={styles.cartaoFavorito}>
                                    <Text style={styles.tituloFavorito}>Título: {fav.title}</Text>
                                    <Text style={styles.descricaoFavorito}>Descrição: {fav.body}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.mensagemSemFavoritos}>Nenhum favorito encontrado.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

function DetalhesPost({ route }) {
    const [detalhesPost, setDetalhesPost] = useState({});
    const [comentarios, setComentarios] = useState([]);
    const [ehFavorito, setEhFavorito] = useState(false);

    useEffect(() => {
        const carregarPost = async () => {
            try {
                const resposta = await fetch(`${URL_COMENTARIOS}${route.params.id}`);
                const post = await resposta.json();
                setDetalhesPost(post);

                const favoritos = SyncStorage.get('favorites') ? JSON.parse(SyncStorage.get('favorites')) : [];
                setEhFavorito(favoritos.some(fav => fav.id === post.id));
            } catch {
                Alert.alert('Falha ao carregar o post');
            }
        };
        carregarPost();
    }, [route.params.id]);

    useEffect(() => {
        const carregarComentarios = async () => {
            try {
                const resposta = await fetch(`${URL_COMENTARIOS}${route.params.id}/comments`);
                const dadosComentarios = await resposta.json();
                setComentarios(dadosComentarios);
            } catch {
                Alert.alert('Falha ao carregar comentários');
            }
        };
        carregarComentarios();
    }, [route.params.id]);

    const alternarFavorito = async () => {
        try {
            const favoritos = SyncStorage.get('favorites') ? JSON.parse(SyncStorage.get('favorites')) : [];
            const novoPost = { id: detalhesPost.id, title: detalhesPost.title, body: detalhesPost.body };

            if (ehFavorito) {
                const favoritosAtualizados = favoritos.filter(fav => fav.id !== detalhesPost.id);
                await SyncStorage.set('favorites', JSON.stringify(favoritosAtualizados));
                setEhFavorito(false);
            } else {
                favoritos.push(novoPost);
                await SyncStorage.set('favorites', JSON.stringify(favoritos));
                setEhFavorito(true);
            }
        } catch {
            Alert.alert('Falha ao atualizar favoritos');
        }
    };

    return (
        <ScrollView style={styles.containerScroll}>
            <View style={styles.containerPrincipal}>
                <Text style={styles.titulo}>Detalhes do Post</Text>
                <View style={styles.containerDetalhes}>
                    <Text style={styles.tituloPost}>Título: {detalhesPost.title}</Text>
                    <Text style={styles.corpoPost}>Corpo: {detalhesPost.body}</Text>
                    <TouchableOpacity onPress={alternarFavorito} style={styles.botao}>
                        <Text style={styles.textoBotao}>
                            {ehFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.tituloComentarios}>Comentários:</Text>
                {comentarios.map(comentario => (
                    <View key={comentario.id} style={styles.comentario}>
                        <Text style={styles.autorComentario}>Nome: {comentario.name}</Text>
                        <Text style={styles.corpoComentario}>Corpo: {comentario.body}</Text>
                        <Text style={styles.emailComentario}>Email: {comentario.email}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="TelaInicial"
                    component={TelaInicial}
                    options={{ title: "Início" }}
                />
                <Stack.Screen
                    name="DetalhesPost"
                    component={DetalhesPost}
                    options={{ title: "Detalhes do Post" }}
                />
                <Stack.Screen
                    name="Favoritos"
                    component={TelaFavoritos}
                    options={{ title: "Meus Favoritos" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    containerScroll: {
        flex: 1,
        backgroundColor: '#e9ecef',
    },
    containerPrincipal: {
        flex: 1,
        alignItems: "center",
        padding: 15,
    },
    titulo: {
        fontSize: 26,
        fontWeight: '700',
        marginVertical: 15,
    },
    cartao: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    conteudoCartao: {
        flex: 1,
    },
    tituloCartao: {
        fontSize: 18,
        fontWeight: '500',
    },
    containerFavoritos: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    cartaoFavorito: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        shadowColor: '#444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tituloFavorito: {
        fontSize: 16,
        fontWeight: '500',
    },
    descricaoFavorito: {
        fontSize: 14,
        color: '#666',
    },
    mensagemSemFavoritos: {
        fontSize: 16,
        color: '#777',
        marginTop: 15,
    },
    containerDetalhes: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
    },
});