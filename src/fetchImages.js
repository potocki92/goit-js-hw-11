const fetchImages = name => {
  const url = `https://pixabay.com/api/?key=34880786-eb7cfd58b108d519b70562252&q=${name}&image_type=photo`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        return Promise.reject(new Error(response.status));
      }
      return response.json();
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(
        new Error('An error occurred while fetching the data.')
      );
    });
};

export { fetchImages };
