import axios from 'axios';

import { fetchImages } from './fetchImages';
import Notiflix from 'notiflix';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const response = fetchImages('cat');

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value;
  fetchImages(searchQuery)
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again'
      );
    });
});
