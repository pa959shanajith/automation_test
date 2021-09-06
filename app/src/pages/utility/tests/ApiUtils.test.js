import React from 'react'
import { mount } from 'enzyme'
import { findByTestAtrr, checkProps } from '../../../setupTests'
import ApiUtils from '../containers/ApiUtils'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from '../../login/state/reducer'
import { act } from 'react-dom/test-utils'

const setUp = (props = {}) => {
    const expectedProps = {
        resetMiddleScreen: jest.fn(),
        setMiddleScreen: jest.fn(),
        setBlockui: jest.fn(),
        setPopup: jest.fn(),
        setScreenType: jest.fn()
    }
    const store = {
        login:{
            dateformat:"DD-MM-YYYY"
        }
    }
    const mockStore = createStore(reducer, store)
    let component
    component = mount(<Provider store={mockStore} ><ApiUtils {...expectedProps} /></Provider>)
    return component

}



const updateWrapper = async (wrapper) => {
    await act(async () => {
        await new Promise(r => setTimeout(r))
        wrapper.update()
    })
}


describe('<ApiUtils/> Positive', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = setUp()
    })
    it('Should contain the expected and required props', () => {
        const expectedProps = {
            resetMiddleScreen: jest.fn(),
            setMiddleScreen: jest.fn(),
        }
        const propsError = checkProps(ApiUtils, expectedProps)
        expect(propsError).toBeUndefined()
    })
    it('Should Render Title', () => {
        const titleComponent = findByTestAtrr(wrapper, 'page-title-test');
        expect(titleComponent.text()).toBe("Api Utils");
    });
    it('Should Render Submit Button', () => {
        const submitComponent = findByTestAtrr(wrapper, 'submit-button-test');
        expect(submitComponent.text()).toBe("Generate");
    });
    it('should render 3 API options', async () => {
        const apiDrop = findByTestAtrr(wrapper, 'api-select-test')
        expect(apiDrop.find('option').length).toBe(3)
        expect(apiDrop.props().value).toBe("Execution")
    })
})

describe('<ApiUtils/> /Execution', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = setUp()
    })
    it('should render 2 Execution Mode', async () => {
        const execmode = findByTestAtrr(wrapper, 'exec-mode-test')
        expect(execmode.length).toBe(2)
    })
    it('should render 2 Execution Env radio button', async () => {
        const execmode = findByTestAtrr(wrapper, 'exec-env-test')
        expect(execmode.length).toBe(2)
    })
    it('should render 5 browser options', async () => {
        const browDrop = findByTestAtrr(wrapper, 'browser-test')
        expect(browDrop.find('option').length).toBe(5)
        expect(browDrop.props().value).toBe(1)
    })
    it('should render 5 Integration options', async () => {
        const integDrop = findByTestAtrr(wrapper, 'integ-test')
        expect(integDrop.find('option').length).toBe(5)
        expect(integDrop.props().value).toBe(-1)
    })
    it('should render 2 Info radio button', async () => {
        const info = findByTestAtrr(wrapper, 'info-test')
        expect(info.length).toBe(2)
    })
    it('updating git Info value', async () => {
        const config = findByTestAtrr(wrapper, 'g-config-test')
        expect(config.length).toBe(1)
        config.props().value = "Test Case"
        const branch = findByTestAtrr(wrapper, 'g-branch-test')
        expect(branch.length).toBe(1)
        branch.props().value = "Master"
        const path = findByTestAtrr(wrapper, 'g-path-test')
        expect(path.length).toBe(1)
        path.props().value = "src/pages"
        const version = findByTestAtrr(wrapper, 'g-version-test')
        expect(version.length).toBe(1)
        version.props().value = "1.0"
    })
    it('generate button output', async () => {
        await updateWrapper(wrapper)
        const config = findByTestAtrr(wrapper, 'g-config-test')
        config.simulate('change', { target: { value: 'Test Case' } })
        const branch = findByTestAtrr(wrapper, 'g-branch-test')
        branch.simulate('change', { target: { value: 'Master' } })
        const path = findByTestAtrr(wrapper, 'g-path-test')
        path.simulate('change', { target: { value: 'src/pages' } })
        const version = findByTestAtrr(wrapper, 'g-version-test')
        version.simulate('change', { target: { value: '1.0' } })
        await updateWrapper(wrapper)
        const submitComponent = findByTestAtrr(wrapper, 'submit-button-test')
        submitComponent.simulate('click')
        await updateWrapper(wrapper)
        const output = findByTestAtrr(wrapper, 'req-body-test')
        const request = {
            executionData: {
                source: "api",
                executionMode: "serial",
                executionEnv: "default",
                browserType: 1,
                gitInfo: {
                    gitConfiguration: 'Test Case',
                    gitbranch: 'Master',
                    folderPath: 'src/pages',
                    gitVersion: "1.0"
                }
            }
        }
        expect(output.props().value).toBe(JSON.stringify(request, undefined, 4));

    })
})

describe('<ApiUtils/> /Report', () => {
    let wrapper;
    it('select Report API option', async () => {
        wrapper = setUp()
        await updateWrapper(wrapper)
        let apiDrop = findByTestAtrr(wrapper, 'api-select-test')
        expect(apiDrop.find('option').length).toBe(3)
        expect(apiDrop.props().value).toBe("Execution")
        apiDrop.simulate('change', { target: { value: "Report" } })
        await updateWrapper(wrapper)
        // console.log(wrapper.debug())
        expect(findByTestAtrr(wrapper, 'api-select-test').props().value).toBe("Report")
    })
    it('should render Execution ID and Scenario IDs', async () => {
        const exec = findByTestAtrr(wrapper, 'exec-id-test')
        const scen = findByTestAtrr(wrapper, 'scen-id-test')
        expect(exec.length).toBe(1)
        expect(scen.length).toBe(1)
        exec.simulate('change', { target: { value: "60ea82e92f55e90ce4168467" } })
        scen.simulate('change', { target: { value: "60ea82e92f55e90ce4168467, 60c8fa604579a5b334fa7441" } })
        await updateWrapper(wrapper)
        //console.log(wrapper.debug())
    })
    it('generate button output', async () => {
        const submitComponent = findByTestAtrr(wrapper, 'submit-button-test')
        submitComponent.simulate('click')
        const output = findByTestAtrr(wrapper, 'req-body-test')
        const request = {
            execution_data: {
                executionId: "60ea82e92f55e90ce4168467",
                scenarioIds: [
                    "60ea82e92f55e90ce4168467",
                    "60c8fa604579a5b334fa7441"
                ]
            }
        }
        expect(output.props().value).toBe(JSON.stringify(request, undefined, 4));

    })
})

describe('<ApiUtils/> /Execution Metrics', () => {
    let wrapper;
    it('select Execution Metrics API option', async () => {
        wrapper = setUp()
        await updateWrapper(wrapper)
        let apiDrop = findByTestAtrr(wrapper, 'api-select-test')
        expect(apiDrop.find('option').length).toBe(3)
        expect(apiDrop.props().value).toBe("Execution")
        apiDrop.simulate('change', { target: { value: "Execution Metrics" } })
        await updateWrapper(wrapper)
        expect(findByTestAtrr(wrapper, 'api-select-test').props().value).toBe("Execution Metrics")
    })
    it('should render all the components', async () => {
        const from = findByTestAtrr(wrapper, 'from-date-test')
        const to = findByTestAtrr(wrapper, 'to-date-test')
        const lob = findByTestAtrr(wrapper, 'lob-test')
        const status = findByTestAtrr(wrapper, 'status-test')
        const exec = findByTestAtrr(wrapper, 'exec-test')
        expect(exec.length).toBe(1)
        expect(from.length).toBe(1)
        expect(to.length).toBe(1)
        expect(lob.length).toBe(1)
        expect(status.length).toBe(1)
        exec.simulate('change', { target: { value: "604ba7caf58f29acf242ce91" } })
        from.simulate('change', { target: { value: "01-03-2021" } })
        to.simulate('change', { target: { value: "11-03-2021" } })
        lob.simulate('change', { target: { value: "Voya" } })
        status.simulate('change', { target: { value: "asdas" } })
        await updateWrapper(wrapper)
       
    })
    // it('generate button output', async () => {
    //     const submitComponent = findByTestAtrr(wrapper, 'submit-button-test')
    //     submitComponent.simulate('click')
    //     await updateWrapper(wrapper)
        
    //     const request = {
    //         metrics_data: {

    //             fromDate: "2021-03-01",

    //             toDate: "2021-03-11",

    //             LOB: "Voya",

    //             status: "asdas",
    //             executionId: "604ba7caf58f29acf242ce91"
            
    //             }

    //     }
    //     let output = findByTestAtrr(wrapper, 'req-body-test')
    //     expect(output.length).toBe(1);
    //     expect(output.props().value).toBe(JSON.stringify(request, undefined, 4));

    // })
})

