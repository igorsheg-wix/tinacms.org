import { Form, useCMS } from 'tinacms'
import { useEffect, useState } from 'react'
import PRPlugin from './pull-request'
import { getForkName } from '../open-authoring/repository'
import { ForkNamePlugin } from './ForkNamePlugin'
import { FormActionsPlugin } from './FormActionsPlugin'
import { DirtyIndicatorPlugin } from './DirtyIndicatorPlugin'

const useFormState = (form, subscription) => {
  const [state, setState] = useState(form.finalForm.getState())
  useEffect(() => {
    form.subscribe(setState, subscription)
  }, [form])

  return state
}

export const useOpenAuthoringToolbarPlugins = (
  form: Form<any>,
  editMode: boolean
) => {
  const cms = useCMS()
  const formState = useFormState(form, { dirty: true, submitting: true })

  useEffect(() => {
    const forkName = getForkName()
    const plugins = [
      ForkNamePlugin(forkName),
      PRPlugin(process.env.REPO_FULL_NAME, forkName),
      FormActionsPlugin(form, formState),
      DirtyIndicatorPlugin(formState),
    ] as any

    const removePlugins = () => {
      plugins.forEach(plugin => cms.plugins.remove(plugin))
    }

    if (editMode) {
      plugins.forEach(plugin => cms.plugins.add(plugin))
    } else {
      removePlugins()
    }

    return removePlugins
  }, [editMode, form, formState])
}