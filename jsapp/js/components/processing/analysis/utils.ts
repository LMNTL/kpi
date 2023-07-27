import type {AnalysisQuestionsState} from './analysisQuestions.reducer';
import type {AnalysisQuestionsAction} from './analysisQuestions.actions';
import type {
  AnalysisQuestionInternal,
  AnalysisQuestionType,
  AnalysisQuestionSchema,
} from './constants';
import {ANALYSIS_QUESTION_TYPES} from './constants';
import {fetchPatch} from 'js/api';
import {endpoints} from 'js/api.endpoints';
import {getAssetAdvancedFeatures} from 'js/assetUtils';
import clonedeep from 'lodash.clonedeep';
import {NO_FEATURE_ERROR} from '../processingActions';
import {notify} from 'js/utils';
import singleProcessingStore from '../singleProcessingStore';
import type {AssetAdvancedFeatures, AssetResponse} from 'js/dataInterface';
import {Json} from '../../common/common.interfaces';

/** Finds given question in state */
export function findQuestion(
  uuid: string,
  state: AnalysisQuestionsState | undefined
) {
  return state?.questions.find((question) => question.uuid === uuid);
}

export function getQuestionTypeDefinition(type: AnalysisQuestionType) {
  return ANALYSIS_QUESTION_TYPES.find((definition) => definition.type === type);
}

export function convertQuestionsFromInternalToSchema(
  /** The qpath of the asset question to which the analysis questions will refer */
  qpath: string,
  questions: AnalysisQuestionInternal[]
): AnalysisQuestionSchema[] {
  return questions.map((question) => {
    return {
      uuid: question.uuid,
      type: question.type,
      labels: question.labels,
      choices: question.additionalFields?.choices,
      scope: 'by_question#survey',
      qpath: qpath,
    };
  });
}

export function convertQuestionsFromSchemaToInternal(
  questions: AnalysisQuestionSchema[]
): AnalysisQuestionInternal[] {
  return questions.map((question) => {
    const output: AnalysisQuestionInternal = {
      uuid: question.uuid,
      type: question.type,
      labels: question.labels,
      response: '',
    };
    if (question.choices) {
      output.additionalFields = {
        choices: question.choices,
      };
    }
    return output;
  });
}

export function getQuestionsFromSchema(
  advancedFeatures?: AssetAdvancedFeatures
): AnalysisQuestionInternal[] {
  return convertQuestionsFromSchemaToInternal(
    advancedFeatures?.qual?.qual_survey || []
  );
}

/**
 * A function that updates the question definitions, i.e. the schema in the
 * advanced features of current asset.
 */
export async function updateSurveyQuestions(
  assetUid: string,
  questions: AnalysisQuestionInternal[]
) {
  const advancedFeatures = clonedeep(getAssetAdvancedFeatures(assetUid));

  const qpath = singleProcessingStore.currentQuestionQpath;

  if (!advancedFeatures || !qpath) {
    notify(NO_FEATURE_ERROR, 'error');
    return;
  }

  if (!advancedFeatures.qual) {
    advancedFeatures.qual = {};
  }

  advancedFeatures.qual.qual_survey = convertQuestionsFromInternalToSchema(
    qpath,
    questions
  );

  const response = await fetchPatch<AssetResponse>(
    endpoints.ASSET_URL.replace(':uid', assetUid),
    {advanced_features: advancedFeatures as Json},
  );

  return response;
}

/**
 * A function that updates the response for a question, i.e. the submission data.
 */
export function quietlyUpdateResponse(
  state: AnalysisQuestionsState | undefined,
  dispatch: React.Dispatch<AnalysisQuestionsAction> | undefined,
  questionUuid: string,
  response: string
) {
  if (!state || !dispatch) {
    return;
  }

  dispatch({type: 'updateResponse'});

  // TODO make actual API call here
  // For now we make a fake response
  console.log('QA fake API call: update response', questionUuid, response);
  setTimeout(() => {
    console.log('QA fake API call: update response DONE');
    dispatch({
      type: 'updateResponseCompleted',
      payload: {
        questions: state.questions.map((item) => {
          if (item.uuid === questionUuid) {
            return {
              ...item,
              response: response,
            };
          } else {
            return item;
          }
        }),
      },
    });
  }, 1000);
}
