import Editor from '@monaco-editor/react'
import { buildFlatRules } from 'Engine/rules'
import { safeLoad } from 'js-yaml'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	analysisWithDefaultsSelector,
	flatRulesSelector
} from 'Selectors/analyseSelectors'
import { setSimulationConfig } from '../../actions/actions'
let initialInput = `

a: 
  formule: 10
b: 
  formule: a + 18
c:
  formule:
    multiplication: 
      assiette: 2000
      taux: 3%
d:
  formule: a + b + c

`

export default function SafeStudio() {
	return (
		<ErrorBoundary>
			<Studio />
		</ErrorBoundary>
	)
}

export function Studio() {
	const defaultTarget = 'b'
	const [ready, setReady] = useState(false)
	const [target, setTarget] = useState(defaultTarget)

	const dispatch = useDispatch()
	const flatRules = useSelector(state => flatRulesSelector(state))

	const [isEditorReady, setIsEditorReady] = useState(false)
	const valueGetter = useRef()
	const setRules = rulesString =>
		dispatch({
			type: 'SET_RULES',
			rules: buildFlatRules(safeLoad(rulesString))
		})
	const setTargets = targets =>
		dispatch(setSimulationConfig({ objectifs: targets }))

	useEffect(() => {
		setRules(initialInput)
		setTargets([defaultTarget])
		setReady(true)
	}, [])

	function handleEditorDidMount(_valueGetter) {
		setIsEditorReady(true)
		valueGetter.current = _valueGetter
	}

	function handleShowValue() {
		setRules(valueGetter.current())
		setTargets([target])
	}

	return (
		<div>
			Saissez des formules
			<Editor
				height="40vh"
				language="yaml"
				value={initialInput}
				editorDidMount={handleEditorDidMount}
			/>
			<label>
				Que voulez-vous calculer ?{' '}
				<select
					name="pets"
					id="pet-select"
					onChange={e => setTarget(e.target.value)}
				>
					{flatRules.map(({ dottedName, title }) => (
						<option key={dottedName} value={dottedName}>
							{title}
						</option>
					))}
				</select>
			</label>
			<br />
			<button
				className="ui__ button"
				onClick={handleShowValue}
				disabled={!isEditorReady}
			>
				Calculer
			</button>
			{ready && <Results />}
		</div>
	)
}
export const Results = () => {
	const analysis = useSelector(state => analysisWithDefaultsSelector(state))
	return (
		<div>
			<h2>Résultats</h2>
			{analysis.targets[0].nodeValue}
		</div>
	)
}

class ErrorBoundary extends React.Component {
	state = {
		error: false
	}
	static getDerivedStateFromError(error) {
		// Mettez à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
		return { error }
	}

	render() {
		return (
			<>
				{this.state.error && (
					<p css="max-height: 4rem; overflow: hidden; border: 3px solid red;">
						Erreur :{' '}
						{
							this.state.error.message.split(
								'The error may be correlated with'
							)[0]
						}
					</p>
				)}
				{this.props.children}
			</>
		)
	}
}