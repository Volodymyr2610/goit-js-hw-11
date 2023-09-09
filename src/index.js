import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchPhoto } from './js/pixabayAPI';
import { createMarkup } from './js/markup';
import { refs } from './js/refs';
import { lightbox } from './js/lightbox';

const { searchFrom, gallery, btnLoadMore } = refs;

const paramsForNotify = {
  position: 'center-center',
  timeout: 4000,
  width: '400px',
  fontSize: '24px',
};

const perPage = 40;
let page = 1;
let apiKeySearchPhoto = '';

btnLoadMore.classList.add('is-hidden');

searchFrom.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
  event.preventDefault();

  gallery.innerHTML = '';

  page = 1;

  const { searchQuery } = event.currentTarget.elements;
  apiKeySearchPhoto = searchQuery.value
    .trim()
    .toLowerCase()
    .split(' ')
    .join('+');

  if (apiKeySearchPhoto === '') {
    Notify.info('Enter your request, please!', paramsForNotify);
    return;
  }

  fetchPhoto(apiKeySearchPhoto, page, perPage)
    .then(data => {
      const searchResults = data.hits;
      if (data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          paramsForNotify
        );
      } else {
        Notify.info(
          `Hooray! We found ${data.totalHits} images.`,
          paramsForNotify
        );
       
        createMarkup(searchResults);
        lightbox.refresh();
      }
      if (data.totalHits > perPage) {
        btnLoadMore.classList.remove('is-hidden');
        window.addEventListener('scroll', showLoadMorePage);
      }
    })
    .catch(onFetchError);

  btnLoadMore.addEventListener('click', onClickLoadMore);

  event.currentTarget.reset();
}

function onClickLoadMore() {
  page += 1;
  fetchPhoto(apiKeySearchPhoto, page, perPage)
    .then(data => {
      const searchResults = data.hits;
      const numberOfPage = Math.ceil(data.totalHits / perPage);

      createMarkup(searchResults);
      if (page === numberOfPage) {
        btnLoadMore.classList.add('is-hidden');
        Notify.info(
          "We're sorry, but you've reached the end of search results.",
          paramsForNotify
        );
        
        btnLoadMore.removeEventListener('click', onClickLoadMore);
        window.removeEventListener('scroll', showLoadMorePage);
      }
      lightbox.refresh();
    })
    .catch(onFetchError);
}


function onFetchError() {
  Notify.failure(
    'Oops! Something went wrong! Try reloading the page or make another choice!',
    paramsForNotify
  );
}

window.addEventListener('scroll', throttle(onScroll, 500));

function onScroll() {
  if (pixabayImg.page > maxPage) {
    return;
  }

  const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

  const scrollPosition = scrollHeight - clientHeight;
  const scrollTopRound = Math.round(scrollTop);

  if (scrollTopRound >= scrollPosition - 1) {
    pixabayImg.getImage().then(markupImgSearch);
  }
}