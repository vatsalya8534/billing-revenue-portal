import { getCompanys } from '@/lib/actions/company';
import { getProjects } from '@/lib/actions/project'
import React from 'react'
import { PLDashboardComponent } from './pl-dashboard-component';

const PLDashboard = async () => {
    const projects = await getProjects();
    const companies = await getCompanys();

    return (
        <div>
            <PLDashboardComponent companies={JSON.parse(JSON.stringify(companies))} projects={JSON.parse(JSON.stringify(projects))} />
            
        </div>
    )
}

export default PLDashboard