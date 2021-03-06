import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { of } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { switchMap, map, filter, catchError } from 'rxjs/operators'
import SearchForm from './SearchForm'
import ResultsList from './ResultsList'
import { storeAllPokemon, updateCurrentQuery } from '../Reducers/pokemonReducer'
import styles from '../CSS-Modules/PokemonSearch.module.css'

const PokemonSearch = props => {
	const [storedPokemon, setStoredPokemon] = useState([])
	const [searchResults, setSearchResults] = useState([])
	const [isDirty, setIsDirty] = useState(false)

	useEffect(() => {
		const allPokemon = fromFetch('https://pokeapi.co/api/v2/pokemon/?limit=1000').pipe(
			switchMap(response => {
				if (response.ok) {
					return response.json()
				} else {
					return of({ error: true, message: `Error: ${response.status}` })
				}
			}),
			map(response => {
				return response.results
			}),
			// filter(pokemon => !pokemon.name.includes('alola') && !pokemon.name.includes('-mega')),

			// switchMap(response => {
			// 	console.log('here', response)
			// 	return response
			// }),
			catchError(error => {
				console.error(error)
				return of({ error: true, message: error.message })
			})
		)

		allPokemon.subscribe({
			next: result => {
				props.storeAllPokemon(result)
				setStoredPokemon(result)
				// console.log({ result })
			},
			error: () => console.log('error'),
			complete: () => console.log('Done')
		})
	}, [])

	const updateCurrentQuery = newQuery => {
		props.updateCurrentQuery(newQuery)
		setIsDirty(true)
		searchPokemon(newQuery)
	}
	
	const searchPokemon = query => {
		const results = storedPokemon.filter(pokemon => pokemon.name.includes(query))
		setSearchResults(results)
	}

	return (
		<div className={styles.everythingHolder}>
			<SearchForm 
				updateCurrentQuery={updateCurrentQuery}
				isFormDirty={isDirty}
			/>
			<ResultsList results={searchResults} />
		</div>
	)
}

// very contrived use of redux. It's just really here for a bit of practice 👯‍
export default connect(
	state => ({ allPokemon: state}),
	{storeAllPokemon, updateCurrentQuery}
)(PokemonSearch)