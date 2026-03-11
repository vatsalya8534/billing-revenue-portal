"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CustomerDefaultValues = {
  firstName?: string
  lastName?: string | null
  companyName?: string | null
  email?: string | null
  phone?: string
  alternatePhone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
  gstNumber?: string | null
  panNumber?: string | null
  website?: string | null
  remark?: string | null
  status?: "ACTIVE" | "INACTIVE"
}

type CustomerFormProps = {
  action: (formData: FormData) => Promise<void>
  defaultValues?: CustomerDefaultValues
}

export default function CustomerForm({
  action,
  defaultValues,
}: CustomerFormProps) {
  return (
    <form action={action} className="space-y-6">

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name *</Label>
            <Input
              name="firstName"
              required
              defaultValue={defaultValues?.firstName ?? ""}
            />
          </div>

          <div>
            <Label>Last Name</Label>
            <Input
              name="lastName"
              defaultValue={defaultValues?.lastName ?? ""}
            />
          </div>

          <div className="col-span-2">
            <Label>Company Name</Label>
            <Input
              name="companyName"
              defaultValue={defaultValues?.companyName ?? ""}
            />
          </div>
        </CardContent>
      </Card>


      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Phone *</Label>
            <Input
              name="phone"
              required
              defaultValue={defaultValues?.phone ?? ""}
            />
          </div>

          <div>
            <Label>Alternate Phone</Label>
            <Input
              name="alternatePhone"
              defaultValue={defaultValues?.alternatePhone ?? ""}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              defaultValue={defaultValues?.email ?? ""}
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              name="website"
              defaultValue={defaultValues?.website ?? ""}
            />
          </div>
        </CardContent>
      </Card>


      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Address Line 1</Label>
            <Input
              name="addressLine1"
              defaultValue={defaultValues?.addressLine1 ?? ""}
            />
          </div>

          <div>
            <Label>Address Line 2</Label>
            <Input
              name="addressLine2"
              defaultValue={defaultValues?.addressLine2 ?? ""}
            />
          </div>

          <div>
            <Label>City</Label>
            <Input
              name="city"
              defaultValue={defaultValues?.city ?? ""}
            />
          </div>

          <div>
            <Label>State</Label>
            <Input
              name="state"
              defaultValue={defaultValues?.state ?? ""}
            />
          </div>

          <div>
            <Label>Country</Label>
            <Input
              name="country"
              defaultValue={defaultValues?.country ?? ""}
            />
          </div>

          <div>
            <Label>Postal Code</Label>
            <Input
              name="postalCode"
              defaultValue={defaultValues?.postalCode ?? ""}
            />
          </div>
        </CardContent>
      </Card>


      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>GST Number</Label>
            <Input
              name="gstNumber"
              defaultValue={defaultValues?.gstNumber ?? ""}
            />
          </div>

          <div>
            <Label>PAN Number</Label>
            <Input
              name="panNumber"
              defaultValue={defaultValues?.panNumber ?? ""}
            />
          </div>
        </CardContent>
      </Card>


      {/* Other Details */}
      <Card>
        <CardHeader>
          <CardTitle>Other Details</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <div>
            <Label>Status</Label>
            <Select
              name="status"
              defaultValue={defaultValues?.status ?? "ACTIVE"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label>Remark</Label>
            <Textarea
              name="remark"
              defaultValue={defaultValues?.remark ?? ""}
            />
          </div>

        </CardContent>
      </Card>


      <Button type="submit">
        Save Customer
      </Button>

    </form>
  )
}