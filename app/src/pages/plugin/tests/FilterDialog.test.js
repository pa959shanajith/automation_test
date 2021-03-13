import React from 'react';
import { shallow,mount} from 'enzyme';
import FilterDialog from '../components/FilterDialog';
import {findByTestAtrr, checkProps} from '../../../setupTests';
import { dataDict,filterData } from './dummyData';


const setUp=()=>{
    const props={
        setShow:jest.fn(), 
        dataDict:dataDict, 
        filterData:filterData, 
        filterTasks:jest.fn()
    }
    let wrapper=mount(<FilterDialog {...props}/>)
    return wrapper;
}


describe('<FilterDialog/> Positive Scenarios',()=>{
    it('Should contain the required and expected props',()=>{
        const expectedProps={
            setShow:jest.fn(),
            dataDict:dataDict, 
            filterData:filterData, 
            filterTasks:jest.fn()
        }
        const propsError=checkProps(FilterDialog,expectedProps)
        expect(propsError).toBeUndefined()
    })
})

describe('<FilterDialog/> Positive Scenarios',()=>{
    let wrapper;
    const props={
        setShow:jest.fn(), 
        dataDict:dataDict, 
        filterData:filterData, 
        filterTasks:jest.fn()
    }
    beforeEach(()=>{
        wrapper=mount(<FilterDialog {...props}/>)
    })
    it('Should render the  componenet',()=>{
        const modalPop=findByTestAtrr(wrapper,'filterModalPop')
        expect(modalPop.length).toBe(1)
        
    }) 
    it('Should render the contents of the modal',()=>{
        // Assert that Project slection is rendered
        expect(findByTestAtrr(wrapper,'selectProjectLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'selectProjectDrop').length).toBe(1)
        // expect(findByTestAtrr(wrapper,'selectProjectDrop').children().length).toBe(3)
        
        
        // Asert that Release selection is rendered
        expect(findByTestAtrr(wrapper,'selectReleaseLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'selectReleaseDrop').length).toBe(1)

        // Assert that Cycle selection is rendered
        expect(findByTestAtrr(wrapper,'selectCycleLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'selectCycleDrop').length).toBe(1)

        // Assert that Task Type is rednered
        expect(findByTestAtrr(wrapper,'taskTypeLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'taskTypeCheckBox').length).toBe(1)

        // Assert that app Type is rendered
        expect(findByTestAtrr(wrapper,'appTypeLabel').length).toBe(1)
        expect(findByTestAtrr(wrapper,'appTypeCheckBox').length).toBe(1)

        //Assert that reset and filter button are renderd
        expect(findByTestAtrr(wrapper,'reset').length).toBe(1)
        expect(findByTestAtrr(wrapper,'filter').length).toBe(1)
    })
    it('Should set,reset and filter',()=>{
       
        let sP=findByTestAtrr(wrapper,'selectProjectDrop')
        sP.simulate('change',{
            target:{
                value:'5fb4fc98f4da702833d7e0a0'
            }
        })
        
        let sR=findByTestAtrr(wrapper,'selectReleaseDrop')
        sR.simulate('change',{
            target:{
                value:'r1'
            }
        })
        
        let sC=findByTestAtrr(wrapper,'selectCycleDrop')
        sC.simulate('change',{
            target:{
                value:{
                    value:'5fb4fc98f4da702833d7e09f'
                }
            }
        })
        let tt=findByTestAtrr(wrapper,'taskTypeCheckBox')
        tt.simulate('change',{target:{checked:true}})
        // Assert that the values are changed
        expect(findByTestAtrr(wrapper,'selectReleaseDrop').prop('value')).toBe("r1")
       

        let resetbtn=findByTestAtrr(wrapper,'reset')
        resetbtn.simulate('click')
        //  Assert that reset button clears the values that were setProject
        expect(findByTestAtrr(wrapper,'selectProjectDrop').prop('value')).toBe("Select Project")
        expect(findByTestAtrr(wrapper,'selectReleaseDrop').prop('value')).toBe("Select Release")
        expect(findByTestAtrr(wrapper,'selectCycleDrop').prop('value')).toBe("Select Cycle")
        
        let filterbtn=findByTestAtrr(wrapper,'filter')
        filterbtn.simulate('click')
        // Assert that filter button is clicked
        expect(props.filterTasks).toBeCalled()
        
    })
});