export const getData = async (src: string) => {
    const response = await fetch(src)
    return await response.json()
}